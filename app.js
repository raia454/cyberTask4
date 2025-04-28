const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'super_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Users database
let users = {
  'administrator': { 
    role: 'ADMIN',
    password: 'admin123' // Storing password for demo purposes (not secure for production)
  },
  'wiener': { 
    role: 'NORMAL',
    password: 'peter123'
  },
  'carlos': { 
    role: 'NORMAL',
    password: 'password123'
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// User login
app.post('/user-login', (req, res) => {
  const { username, password } = req.body;
  
  if (!users[username] || users[username].password !== password) {
    return res.status(401).json({ 
      success: false, 
      error: '❌ اسم المستخدم أو كلمة المرور خاطئة.' 
    });
  }

  if (username === 'administrator') {
    return res.status(403).json({ 
      success: false, 
      error: '❌ أنت أدمن! سجل دخولك من صفحة الأدمن فقط.' 
    });
  }

  req.session.username = username;
  req.session.role = users[username].role;
  res.json({ success: true, role: users[username].role });
});

// Admin login (simplified and fixed)
app.post('/adminlogin', (req, res) => {
  const { username, password } = req.body;

  if (username === 'administrator' && password === 'admin123') {
    req.session.username = username;
    req.session.role = users[username].role;
    return res.json({ success: true, role: users[username].role });
  }

  res.status(401).json({ 
    success: false, 
    error: '❌ بيانات الدخول غير صحيحة.' 
  });
});

// Authentication check
app.get('/api/user', (req, res) => {
  if (!req.session.username) {
    return res.json({ authenticated: false });
  }
  res.json({ 
    authenticated: true, 
    username: req.session.username, 
    role: req.session.role 
  });
});

// Admin routes
app.get('/api/users', (req, res) => {
  if (!req.session.username || req.session.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access Denied' });
  }
  res.json(users);
});

app.get('/admin/delete', (req, res) => {
  const { username } = req.query;
  if (!req.session.username || req.session.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access Denied' });
  }
  if (username && users[username]) {
    delete users[username];
    res.json({ success: true, message: `User ${username} deleted!` });
  } else {
    res.status(404).json({ error: 'User not found.' });
  }
});

app.post('/admin/edit', (req, res) => {
  const { oldUsername, newUsername } = req.body;
  if (!req.session.username || req.session.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access Denied' });
  }
  if (users[oldUsername]) {
    users[newUsername] = users[oldUsername];
    delete users[oldUsername];
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});