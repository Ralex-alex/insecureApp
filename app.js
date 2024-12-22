const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const path = require('path');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const session = require('express-session');
const morgan = require('morgan'); // For logging HTTP requests
const fs = require('fs'); // For custom logging
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const port = 3000;

// Logging Middleware
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false, // Prevent creating sessions for unauthenticated requests
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Enforce Middleware Globally
app.use((req, res, next) => {
    // Define routes that don't require authentication
    const publicRoutes = ['/login.html', '/auth/login', '/auth/logout', '/', '/css/styles.css'];

    // Check if the current route is in public routes or is a static file
    if (publicRoutes.includes(req.originalUrl) || req.originalUrl.startsWith('/css') || req.originalUrl.startsWith('/public')) {
        return next(); // Allow access to public routes and static assets
    }

    // If the user is not logged in, redirect to login
    if (!req.session.user) {
        console.log(`[GLOBAL PROTECTION] Unauthorized access attempt to ${req.originalUrl}`);
        return res.redirect('/login.html');
    }

    next(); // Allow access to protected routes if logged in
});


// Initialize the database
db.initializeDatabase();

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);



app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Protect role-specific dashboards
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
    res.sendFile(path.join(__dirname, 'views', 'index.html')); // Serve the main page
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
