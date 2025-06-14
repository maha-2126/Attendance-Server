const jwt = require('jsonwebtoken'); // remove from imports.js if unnecessary
require('dotenv').config(); // ensure .env is loaded

const { accessTokenExpiresIn, refreshTokenExpiresIn } = require('../config/config');

const signAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: accessTokenExpiresIn || '30d',
  });
};

const signRefreshToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: refreshTokenExpiresIn || '30d',
  });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
};
