const express = require('express');
const router = express.Router();
const { db } = require('../database');

// View all courses
router.get('/viewCourses', (req, res) => {
    const sql = `SELECT course_name, teacher_id FROM courses`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching courses.');
        }
        res.json(rows);
    });
});

// View assignments by course_name
router.get('/viewAssignments', (req, res) => {
    const { course_name } = req.query;
    const sql = `SELECT title, description FROM assignments WHERE course_name = ?`;
    db.all(sql, [course_name], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching assignments.');
        }
        res.json(rows);
    });
});

module.exports = router;
