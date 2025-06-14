module.exports = {
  accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  refreshTokenExpiresIn: '30d',
};
