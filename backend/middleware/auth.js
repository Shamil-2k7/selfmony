const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token found, authorization denied' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'selfmony_secret_key_123_abc';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = decoded; // Contains userId
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired', error: error.message });
  }
};

module.exports = auth;
