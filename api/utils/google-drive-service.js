const https = require('https');
const { URL } = require('url');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

function requestHttps(options, postData = null, isBufferPayload = false) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const bodyStr = Buffer.concat(chunks).toString('utf8');
                try {
                    const parsed = JSON.parse(bodyStr);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.error_description || (parsed.error && parsed.error.message) || `HTTP ${res.statusCode}: ${bodyStr}`));
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(bodyStr);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${bodyStr}`));
                    }
                }
            });
        });
        req.on('error', (err) => reject(err));
        if (postData) {
            if (isBufferPayload) {
                req.write(postData);
            } else if (typeof postData === 'string') {
                req.write(postData);
            } else {
                req.write(JSON.stringify(postData));
            }
        }
        req.end();
    });
}

function getAuthUrl(redirectUri, state = '') {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent',
        state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function getTokensFromCode(code, redirectUri) {
    const postData = new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    }).toString();

    const options = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    return requestHttps(options, postData);
}

async function getFreshAccessToken(refreshToken) {
    const postData = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    }).toString();

    const options = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const res = await requestHttps(options, postData);
    return res.access_token;
}

async function getUserEmail(accessToken) {
    const options = {
        hostname: 'www.googleapis.com',
        path: '/oauth2/v2/userinfo',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    const res = await requestHttps(options);
    return res.email;
}

async function uploadFileToDrive(refreshToken, fileBuffer, fileName, mimeType) {
    const accessToken = await getFreshAccessToken(refreshToken);

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
        name: fileName,
        mimeType: mimeType || 'application/octet-stream',
    };

    const multipartRequestBody = Buffer.concat([
        Buffer.from(
            `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}${delimiter}Content-Type: ${metadata.mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n`,
            'utf8',
        ),
        Buffer.from(fileBuffer.toString('base64'), 'utf8'),
        Buffer.from(closeDelimiter, 'utf8'),
    ]);

    const options = {
        hostname: 'www.googleapis.com',
        path: '/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': multipartRequestBody.length,
        },
    };

    const fileRes = await requestHttps(options, multipartRequestBody, true);

    // Make file readable by anyone with the link
    try {
        const permData = JSON.stringify({ role: 'reader', type: 'anyone' });
        const permOptions = {
            hostname: 'www.googleapis.com',
            path: `/drive/v3/files/${fileRes.id}/permissions`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(permData),
            },
        };
        await requestHttps(permOptions, permData);
    } catch (e) {
        console.warn('Could not set public read permission on Google Drive file:', e.message);
    }

    return {
        id: fileRes.id,
        name: fileRes.name,
        webViewLink: fileRes.webViewLink || `https://drive.google.com/file/d/${fileRes.id}/view`,
        webContentLink: fileRes.webContentLink || `https://drive.google.com/uc?id=${fileRes.id}&export=download`,
    };
}

module.exports = {
    getAuthUrl,
    getTokensFromCode,
    getFreshAccessToken,
    getUserEmail,
    uploadFileToDrive,
};
