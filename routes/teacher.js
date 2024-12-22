const express = require('express');
const router = express.Router();
const { db } = require('../database');

// View courses assigned to a teacher
router.get('/viewCourses', (req, res) => {
    const { teacher_id } = req.query;
    db.all(`SELECT * FROM courses WHERE teacher_id = ${teacher_id}`, (err, rows) => { // Vulnerable to SQL Injection
        if (err) {
            res.status(500).send('Error fetching courses from the database.');
        } else {
            res.json(rows);
        }
    });
});

// Edit a course's details
router.post('/editCourse', (req, res) => {
    const { id, name } = req.body;
    db.run(`UPDATE courses SET name = '${name}' WHERE id = ${id}`, (err) => { // Vulnerable to SQL Injection
        if (err) {
            res.status(500).send('Error updating course in the database.');
        } else {
            res.send('Course updated successfully.');
        }
    });
});

// Add Assignment
router.post('/addAssignment', (req, res) => {
    const { course_id, title, description } = req.body;
    db.run(
        `INSERT INTO assignments (course_id, title, description) VALUES (${course_id}, '${title}', '${description}')`, // Vulnerable to SQL Injection
        (err) => {
            if (err) {
                res.status(500).send('Error adding assignment.');
            } else {
                res.send('Assignment added successfully.');
            }
        }
    );
});



module.exports = router;
