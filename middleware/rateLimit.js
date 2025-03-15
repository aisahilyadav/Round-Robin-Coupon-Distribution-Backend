const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // limit each IP to 1 request per windowMs
  message: 'Too many attempts, please try again after 24 hours'
});

module.exports = limiter; 