const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users').authenticated;
const generalRoutes = require('./router/general').general;

const app = express();
app.use(express.json());
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'bookshop-local-session-secret',
  resave: false,
  saveUninitialized: false,
}));
app.use('/customer/auth', (req, res, next) => {
  const token = req.session.authorization?.accessToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'bookshop-local-demo-secret');
    return next();
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

const PORT = Number(process.env.PORT || 5000);
if (require.main === module) app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
module.exports = app;
