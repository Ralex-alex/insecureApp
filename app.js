/*****************************************************
 * SECURE VERSION
 *****************************************************/
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const morgan = require('morgan');
const fs = require('fs');
const csurf = require('csurf');

const { db, initializeDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const authMiddleware = require('./middlewares/authMiddleware'); 

const app = express();
const port = 3000;

// 1) Logging middleware
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// 2) Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 3) Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// 4) Static Files
app.use(express.static(path.join(__dirname, 'public')));

// 5) Session
app.use(session({
  secret: 'my_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // For local HTTP dev; use true if behind HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// 6) Initialize DB
initializeDatabase();

// 7) Create a CSRF instance
const csrfProtection = csurf();

// 8) Apply CSRF to certain route prefixes
app.use('/admin', csrfProtection);
app.use('/teacher', csrfProtection);
app.use('/student', csrfProtection);

// 9) Conditionally bypass CSRF for certain POST routes under /auth
app.use('/auth', (req, res, next) => {
  // If the request is POST /auth/register, POST /auth/login, or POST /auth/logout
  if (
    (req.method === 'POST') &&
    (req.path === '/register' || req.path === '/login' || req.path === '/logout')
  ) {
    // Skip CSRF
    return next();
  }
  // Otherwise, enforce CSRF
  csrfProtection(req, res, next);
});

// 10) Now load your routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

// 11) Public vs. Protected Routes (optional global check)
app.use((req, res, next) => {
  // For example:
  const publicRoutes = [
    '/login.html',
    '/register.html',
    '/',
    '/auth/login',
    '/auth/logout',
    '/auth/register',
    '/css/styles.css'
  ];

  // Insert your public-routes logic here...
  next();
});

// 12) Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/admin.html', authMiddleware('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});
app.get('/teacher.html', authMiddleware('teacher'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'teacher.html'));
});
app.get('/student.html', authMiddleware('student'), (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'student.html'));
});

// 13) Listen
app.listen(port, () => {
  console.log(`Secure version running on http://localhost:${port}`);
});
