const config = require('../mail-config');
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

aws.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.awsRegion,
});

/**
 * @param {string} email
 * @param {string} motivo
 * @param {string} mensaje
 * @param {{ fromEmail: string, fromDisplayName?: string } | null} [remitente] Si se indica, el From es el usuario (SES debe autorizar ese remitente).
 */
const enviarMail = async (email, motivo, mensaje, remitente = null) => {
  try {
    let transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01'
      })
    });

    const fromDefault = `"GORU" <${config.fromEmail}>`;
    let fromLine = fromDefault;
    const mailPayload = {
      to: [email],
      subject: motivo,
      text: mensaje,
    };
    if (remitente && remitente.fromEmail) {
      const dn = (remitente.fromDisplayName || 'GORU').replace(/"/g, "'");
      fromLine = `"${dn}" <${remitente.fromEmail}>`;
      mailPayload.replyTo = remitente.fromEmail;
    } else {
      mailPayload.bcc = [email];
    }
    mailPayload.from = fromLine;

    let message = await transporter.sendMail(mailPayload);

    logger.info({ message: `Mensaje enviado: ${message.messageId}` });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "enviarMail()",
      params: { email, motivo, mensaje }
    });

    throw error;
  }

}

/**
 * @param {string} email
 * @param {string} motivo
 * @param {string} mensaje
 * @param {Array<{filename: string, content: Buffer, contentType?: string}>} [attachments]
 */
const enviarMailConAdjunto = async (email, motivo, mensaje, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01',
      }),
    });

    const mailPayload = {
      from: `"GORU" <${config.fromEmail}>`,
      to: [email],
      subject: motivo,
      text: mensaje,
    };

    if (attachments && attachments.length > 0) {
      mailPayload.attachments = attachments;
    }

    const message = await transporter.sendMail(mailPayload);
    logger.info({ message: `Mensaje con adjunto enviado: ${message.messageId}` });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: 'enviarMailConAdjunto()',
      params: { email, motivo },
    });
    throw error;
  }
};

module.exports = {
  enviarMail,
  enviarMailConAdjunto,
}