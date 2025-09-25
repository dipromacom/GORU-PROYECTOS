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

const enviarMail = async (email, motivo, mensaje) => {
  try {
    let transporter = nodemailer.createTransport({
      SES: new aws.SES({
        apiVersion: '2010-12-01'
      })
    });
  
    let message = await transporter.sendMail({
      from: `"GORU" <${config.fromEmail}>`,
      to: [ email ],
      bcc: [ email ],
      subject: motivo,
      text: mensaje,
    });
  
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

module.exports = {
  enviarMail,
}