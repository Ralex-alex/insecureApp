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

    // Check for hardcoded admin credentials
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Set admin session
        req.session.user = { username: 'admin', role: 'admin' };
        return res.redirect('/admin.html'); // Redirect to admin dashboard
    }

    // For other users, query the database (Insecure SQL Query)
    db.get(
        `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, // Vulnerable to SQL Injection
        (err, row) => {
            if (err) {
                res.status(500).send('Error querying the database.');
            } else if (row) {
                // Set session for the user
                req.session.user = { username: row.username, role: row.role };

                // Redirect based on role
                const redirectPage = {
                    admin: '/admin.html',
                    teacher: '/teacher.html',
                    student: '/student.html',
                };

                res.redirect(redirectPage[row.role] || '/login.html');
            } else {
                res.status(401).send('Invalid credentials.');
            }
        }
    );
});


router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).send('No active session.');
    }
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






module.exports = router;
