const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { db } = require('../database');


router.get('/getCsrf', (req, res) => {
    // The csurf middleware has already attached req.csrfToken()
    const token = req.csrfToken();
    res.json({ csrfToken: token });
  });
  
  
// On login
router.post('/login', async (req, res) => {
    const { username, password, _csrf } = req.body; // Retrieve CSRF token
    // Hardcoded admin
    const adminCredentials = { username: 'admin', password: 'admin1' };

    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.session.user = { username: 'admin', role: 'admin' };
        return res.redirect('/admin.html');
    }

    // Use hashed password compare
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, row) => {
        if (err) return res.status(500).send('DB error.');
        if (!row) return res.status(401).send('Invalid credentials.');

        const match = await bcrypt.compare(password, row.password);
        if (!match) {
            return res.status(401).send('Invalid credentials.');
        }

        req.session.user = { username: row.username, role: row.role, teacher_id: row.teacher_id };
        const redirectMap = {
            admin: '/admin.html',
            teacher: '/teacher.html',
            student: '/student.html',
        };
        return res.redirect(redirectMap[row.role] || '/login.html');
    });
});

router.get('/session', (req, res) => {
    if (req.session.user) {
        return res.json(req.session.user);
    }
    res.status(401).send('No active session.');
});





router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out.');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    });
});

// Render register page
router.get('/register', (req, res) => {
    // Could embed a CSRF token if we were using EJS forms
    res.sendFile('register.html', { root: 'views' });
});

// Register new user (secure: hash password)
router.post('/register', async (req, res) => {
    const { username, password, role, _csrf } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
        db.run(sql, [username, hashedPassword, role], function(err) {
            if (err) {
                return res.status(500).send('Error registering user.');
            }
            res.redirect('/login.html');
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user.');
    }
});



module.exports = router;
