const express = require('express');
const router = express.Router();
const fs = require('fs');
const { db } = require('../database');

// Add or Update a User
// - If role='teacher' and teacher_id is provided, store teacher_id
router.post('/addUser', (req, res) => {
    const { id, username, password, role } = req.body; 
    // 'id' here is interpreted as teacher_id for teachers, or ignored otherwise

    // If teacher AND teacher_id provided
    if (role === 'teacher' && id) {
        const sql = `INSERT INTO users (username, password, role, teacher_id) 
                     VALUES (?, ?, ?, ?)`;
        db.run(sql, [username, password, role, id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error adding teacher to the database.');
            }
            return res.redirect('/admin.html?message=Teacher added successfully');
        });
    } else {
        // student or admin, or teacher with no teacher_id
        const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
        db.run(sql, [username, password, role], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error adding user to the database.');
            }
            return res.redirect('/admin.html?message=User added successfully');
        });
    }
});

// Remove User by username
router.post('/removeUser', (req, res) => {
    const { username } = req.body;
    const sql = `DELETE FROM users WHERE username = ?`;
    db.run(sql, [username], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error removing user from the database.');
        }
        return res.redirect('/admin.html?message=Removed user successfully');
    });
});

// Add Course by name (PK), referencing teacher_id
router.post('/addCourse', (req, res) => {
    const { name, teacher_id } = req.body; 
    const sql = `INSERT INTO courses (course_name, teacher_id) VALUES (?, ?)`;
    db.run(sql, [name, teacher_id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding course to the database.');
        }
        return res.redirect('/admin.html?message=Course Added Successfully');
    });
});

// Remove Course by name
router.post('/removeCourse', (req, res) => {
    const { name } = req.body;
    const sql = `DELETE FROM courses WHERE course_name = ?`;
    db.run(sql, [name], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error removing course from the database.');
        }
        return res.redirect('/admin.html?message=Removed course successfully');
    });
});

// Reassign or update teacher for an existing course
router.post('/assignTeacher', (req, res) => {
    const { name, teacher_id } = req.body; // course_name = name
    const sql = `UPDATE courses SET teacher_id = ? WHERE course_name = ?`;
    db.run(sql, [teacher_id, name], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error assigning teacher to the course.');
        }
        res.send('Teacher assigned successfully.');
    });
});

// View server logs
router.get('/viewLogs', (req, res) => {
    const logFilePath = './server.log'; // Path to your log file
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading log file.' });
        }
        return res.json({ logs: data.split('\n') }); 
    });
});

// Edit User details (e.g., username, password, role, teacher_id)
router.post('/editUser', (req, res) => {
    const { id, username, password, role } = req.body;
    // 'id' here is teacher_id if role=teacher, otherwise null
    let sql, params;

    if (role === 'teacher' && id) {
        sql = `UPDATE users 
               SET password = ?, role = ?, teacher_id = ? 
               WHERE username = ?`;
        params = [password, role, id, username];
    } else {
        // if user is not teacher or no teacher_id
        sql = `UPDATE users 
               SET password = ?, role = ?, teacher_id = NULL
               WHERE username = ?`;
        params = [password, role, username];
    }

    db.run(sql, params, (err) => {
        if (err) {
            console.error(err);
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
            console.error(err);
            return res.status(500).send('Error fetching users from the database.');
        }
        res.json(rows);
    });
});

module.exports = router;
