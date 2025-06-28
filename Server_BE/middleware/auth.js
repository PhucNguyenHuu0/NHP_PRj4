const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    console.log('Authenticated user:', decoded);
    next();
  } catch (err) {
    console.log('Invalid token:', err.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    console.log('Access denied for user:', req.user);
    return res.status(403).json({ error: 'Admin access required' });
  }
  console.log('Admin access granted for user:', req.user);
  next();
};

module.exports = { authenticateToken, isAdmin };