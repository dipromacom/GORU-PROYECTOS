/* eslint-disable no-unused-vars */
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const jwt = require("jsonwebtoken");

const generateToken = async (usuario) => {
  const user = { email: usuario.username, id: usuario.id };
  const jwtToken = await jwt.sign(user, process.env.SECRET);
  return jwtToken;
}

const validateToken = (callback) => (req, res) => {
  const authHeaders = req.headers.authorization;
  const token = authHeaders !== undefined ? authHeaders.split(' ')[1] : '';
  jwt.verify(token, process.env.SECRET, (error, payload) => {
    if (error) {
      res.status(403).json({ success: false, message: "No posee permisos para esta operación" });
    } else {
      callback(req, res);
    }
  })
}

const decodeToken = (authHeader) => {
  const token = authHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.SECRET);
  return decodedToken;
}

module.exports = {
  generateToken,
  validateToken,
  decodeToken,
}
