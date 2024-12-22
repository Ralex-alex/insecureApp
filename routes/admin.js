const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const fs = require('fs');
const { db } = require('../database');

// Add or Update a User
router.post('/addUser', async (req, res) => {
    const { id, username, password, role, _csrf } = req.body;

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    if (role === 'teacher' && id) {
        const sql = `INSERT INTO users (username, password, role, teacher_id) VALUES (?, ?, ?, ?)`;
        db.run(sql, [username, hashed, role, id], (err) => {
            if (err) {
                return res.status(500).send('Error adding teacher.');
            }
            return res.redirect('/admin.html?message=Teacher added successfully');
        });
    } else {
        const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
        db.run(sql, [username, hashed, role], (err) => {
            if (err) {
                return res.status(500).send('Error adding user.');
            }
            return res.redirect('/admin.html?message=User added successfully');
        });
    }
});

// Remove User
router.post('/removeUser', (req, res) => {
    const { username, _csrf } = req.body;
    const sql = `DELETE FROM users WHERE username = ?`;
    db.run(sql, [username], (err) => {
        if (err) {
            return res.status(500).send('Error removing user.');
        }
        return res.redirect('/admin.html?message=Removed user successfully');
    });
});

// Add Course
router.post('/addCourse', (req, res) => {
    const { name, teacher_id, _csrf } = req.body;
    const sql = `INSERT INTO courses (course_name, teacher_id) VALUES (?, ?)`;
    db.run(sql, [name, teacher_id], (err) => {
        if (err) {
            return res.status(500).send('Error adding course.');
        }
        return res.redirect('/admin.html?message=Course Added Successfully');
    });
});

// Remove Course
router.post('/removeCourse', (req, res) => {
    const { name, _csrf } = req.body;
    const sql = `DELETE FROM courses WHERE course_name = ?`;
    db.run(sql, [name], (err) => {
        if (err) {
            return res.status(500).send('Error removing course.');
        }
        return res.redirect('/admin.html?message=Removed course successfully');
    });
});

// Assign Teacher
router.post('/assignTeacher', (req, res) => {
    const { name, teacher_id, _csrf } = req.body;
    const sql = `UPDATE courses SET teacher_id = ? WHERE course_name = ?`;
    db.run(sql, [teacher_id, name], (err) => {
        if (err) {
            return res.status(500).send('Error assigning teacher.');
        }
        res.send('Teacher assigned successfully.');
    });
});

// View server logs
router.get('/viewLogs', (req, res) => {
    const logFilePath = './server.log'; 
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading log file.' });
        }
        return res.json({ logs: data.split('\n') });
    });
});

// Edit User details
router.post('/editUser', async (req, res) => {
    const { id, username, password, role, _csrf } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    let sql, params;
    if (role === 'teacher' && id) {
        sql = `UPDATE users SET password = ?, role = ?, teacher_id = ? WHERE username = ?`;
        params = [hashed, role, id, username];
    } else {
        sql = `UPDATE users SET password = ?, role = ?, teacher_id = NULL WHERE username = ?`;
        params = [hashed, role, username];
    }

    db.run(sql, params, (err) => {
        if (err) {
            return res.status(500).send('Error updating user details.');
        }
        return res.send('User details updated successfully.');
    });
});

// View all users
router.get('/viewUsers', (req, res) => {
    const sql = `SELECT user_id, username, role, teacher_id FROM users`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching users.');
        }
        res.json(rows);
    });
});

module.exports = router;
