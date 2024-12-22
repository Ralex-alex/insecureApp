const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Authentication Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded Admin Credentials (Insecure for demonstration)
    const adminCredentials = {
        username: 'admin',
        password: 'admin1',
    };

    // Check for hardcoded admin credentials first
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Set admin session
        req.session.user = { username: 'admin', role: 'admin' };
        return res.redirect('/admin.html'); // Redirect to admin dashboard
    }

    // Otherwise, query the database (use parameterized query)
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(sql, [username, password], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error querying the database.');
        }
        if (row) {
            // Set session for the user
            req.session.user = { username: row.username, role: row.role, teacher_id: row.teacher_id };
            // Redirect based on role
            const redirectMap = {
                admin: '/admin.html',
                teacher: '/teacher.html',
                student: '/student.html',
            };
            const redirectPage = redirectMap[row.role] || '/login.html';
            res.redirect(redirectPage);
        } else {
            res.status(401).send('Invalid credentials.');
        }
    });
});

router.get('/session', (req, res) => {
    if (req.session.user) {
        return res.json(req.session.user);
    }
    res.status(401).send('No active session.');
});

// Logout Route
router.get('/logout', (req, res) => {
    console.log('Logging out...');
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out.');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        console.log('Session destroyed and cookie cleared.');
        res.redirect('/login.html');
    });
});


// 1) Serve the register page
router.get('/register', (req, res) => {
    // If you want, you can protect it if user is logged in, 
    // but usually register is public.
    res.sendFile('register.html', { root: 'views' });
});

// 2) Handle the register form submission
router.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    // Insert a new user record. 
    // Parametrize to avoid SQL injection. 
    // By default, or if user selected role, we store it accordingly.
    const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
    db.run(sql, [username, password, role], function(err) {
        if (err) {
            console.error('Error creating new user:', err);
            return res.status(500).send('Error registering user.');
        }
        // After successful registration, redirect them to login
        res.redirect('/login.html');
    });
});

module.exports = router;
