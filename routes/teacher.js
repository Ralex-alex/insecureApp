const express = require('express');
const router = express.Router();
const { db } = require('../database');

// View courses by teacher_id
router.get('/viewCourses', (req, res) => {
    const { teacher_id } = req.query;
    const sql = `SELECT course_name FROM courses WHERE teacher_id = ?`;
    db.all(sql, [teacher_id], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching courses.');
        }
        res.json(rows);
    });
});

// Rename course
router.post('/editCourse', (req, res) => {
    const { old_name, new_name, _csrf } = req.body;
    const sql = `UPDATE courses SET course_name = ? WHERE course_name = ?`;
    db.run(sql, [new_name, old_name], (err) => {
        if (err) {
            return res.status(500).send('Error updating course.');
        }
        res.send('Course updated successfully.');
    });
});

// Add assignment
router.post('/addAssignment', (req, res) => {
    const { course_name, title, description, _csrf } = req.body;
    const sql = `INSERT INTO assignments (course_name, title, description) VALUES (?, ?, ?)`;
    db.run(sql, [course_name, title, description], (err) => {
        if (err) {
            return res.status(500).send('Error adding assignment.');
        }
        res.send('Assignment added successfully.');
    });
});

module.exports = router;
