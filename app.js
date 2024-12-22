const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const morgan = require('morgan');
const fs = require('fs');

// DB
const { db, initializeDatabase } = require('./database');

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const authMiddleware = require('./middlewares/authMiddleware'); // If you have a custom role-based middleware

const app = express();
const port = 3000;

// Logging Middleware
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup
app.use(session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set secure=true if using HTTPS
}));

// Global Access Control
app.use((req, res, next) => {
    // Public routes
    const publicRoutes = [
        '/login.html',
        '/register.html',    // <-- ADDED
        '/auth/login',
        '/auth/logout',
        '/auth/register',    // <-- ADDED
        '/',
        '/css/styles.css'
    ];

    // Check if the current route is in public routes or is a static file (like /public, /css)
    if (
        publicRoutes.includes(req.originalUrl) ||
        req.originalUrl.startsWith('/css') ||
        req.originalUrl.startsWith('/public')
    ) {
        return next();
    }

    // If no session user, redirect to login
    if (!req.session.user) {
        console.log(`[GLOBAL PROTECTION] Unauthorized access attempt to ${req.originalUrl}`);
        return res.redirect('/login.html');
    }

    next();
});

// Initialize DB
initializeDatabase();

// Use routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

// Serve HTML pages
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Serve register.html (if you want a standalone page)
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

// Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
