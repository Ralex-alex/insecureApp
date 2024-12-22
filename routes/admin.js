const express = require('express');
const router = express.Router();
const fs = require('fs'); // Correct declaration
const { db } = require('../database');

// Add User (with specific ID for teachers)
router.post('/addUser', (req, res) => {
    const { id, username, password, role } = req.body;

    const sql = role === 'teacher' && id
        ? `INSERT INTO users (id, username, password, role) VALUES (${id}, '${username}', '${password}', '${role}')`
        : `INSERT INTO users (username, password, role) VALUES ('${username}', '${password}', '${role}')`;

    db.run(sql, (err) => { // Vulnerable to SQL Injection
        if (err) {
            res.status(500).send('Error adding user to the database.');
        } else {
            res.redirect('/admin.html?message=User added successfully');

        }
    });
});


// Remove User
router.post('/removeUser', (req, res) => {
    const { username } = req.body;
    db.run(`DELETE FROM users WHERE username = '${username}'`, (err) => { // Vulnerable to SQL Injection
        if (err) {
            res.status(500).send('Error removing user from the database.');
        } else {
            rres.redirect('/admin.html?message=Removed user successfully');

        }
    });
});

// Add Course
router.post('/addCourse', (req, res) => {
    const { name, teacher_id } = req.body;
    db.run(`INSERT INTO courses (name, teacher_id) VALUES ('${name}', ${teacher_id})`, (err) => { // Vulnerable to SQL Injection
        if (err) {
            res.status(500).send('Error adding course to the database.');
        } else {
            res.redirect('/admin.html?message=Course Added Successfully');

        }
    });
});

// Remove Course
router.post('/removeCourse', (req, res) => {
    const { name } = req.body;
    db.run(`DELETE FROM courses WHERE name = '${name}'`, (err) => { // Vulnerable to SQL Injection
        if (err) {
            res.status(500).send('Error removing course from the database.');
        } else {
            res.redirect('/admin.html?message=User added successfully');

        }
    });
});

// Assign a teacher to a course
router.post('/assignTeacher', (req, res) => {
    const { course_id, teacher_id } = req.body;
    db.run(
        `UPDATE courses SET teacher_id = ${teacher_id} WHERE id = ${course_id}`, // Vulnerable to SQL Injection
        (err) => {
            if (err) {
                res.status(500).send('Error assigning teacher to the course.');
            } else {
                res.send('Teacher assigned successfully.');
            }
        }
    );
});

// Add a student to a course
router.post('/addStudentToCourse', (req, res) => {
    const { student_id, course_id } = req.body;
    db.run(
        `INSERT INTO timetables (student_id, course_id) VALUES (${student_id}, ${course_id})`, // Vulnerable to SQL Injection
        (err) => {
            if (err) {
                res.status(500).send('Error adding student to the course.');
            } else {
                res.send('Student added to the course successfully.');
            }
        }
    );
});

// Remove a student from a course
router.post('/removeStudentFromCourse', (req, res) => {
    const { student_id, course_id } = req.body;
    db.run(
        `DELETE FROM timetables WHERE student_id = ${student_id} AND course_id = ${course_id}`, // Vulnerable to SQL Injection
        (err) => {
            if (err) {
                res.status(500).send('Error removing student from the course.');
            } else {
                res.send('Student removed from the course successfully.');
            }
        }
    );
});

// View server logs
router.get('/viewLogs', (req, res) => {
    const logFilePath = './server.log'; // Path to your log file
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error reading log file.' });
        } else {
            res.json({ logs: data.split('\n') }); // Return logs as an array of lines
        }
    });
});

// Edit User Details
router.post('/editUser', (req, res) => {
    const { id, username, password, role } = req.body;

    const sql = `UPDATE users SET username = '${username}', password = '${password}', role = '${role}' WHERE id = ${id}`;
    db.run(sql, (err) => { // Vulnerable to SQL Injection
        if (err) {
            res.status(500).send('Error updating user details.');
        } else {
            res.send('User details updated successfully.');
        }
    });
});

// View All Users
router.get('/viewUsers', (req, res) => {
    db.all(`SELECT id, username, role FROM users`, (err, rows) => {
        if (err) {
            res.status(500).send('Error fetching users from the database.');
        } else {
            res.json(rows);
        }
    });
});


module.exports = router;
