const crypto = require('crypto');

const sessionCheck = (req, res, next) => {
  let sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    sessionId = crypto.randomBytes(32).toString('hex');
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }
  
  req.sessionId = sessionId;
  next();
};

module.exports = sessionCheck; 