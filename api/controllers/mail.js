const MailUtils = require('../utils/mail-utils');

const logger = require('../logger/logger');
const path = require('path');
const file = path.basename(__filename);

const enviarMail = async (req, res) => {
  const { mail, motivo, mensaje } = req.body;

  try {
    await MailUtils.enviarMail(mail, motivo, mensaje);
    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error({
      message: error.message,
      source: file,
      method: "enviarMail()",
      params: req.body
    });

    return res.status(500).json({ success: false });
  }
}

module.exports = {
  enviarMail
};