const express = require('express');
const router = express.Router();
const { db } = require('../database');

// View student's timetable
router.get('/viewTimetable', (req, res) => {
    const { student_id } = req.query;
    db.all(
        `SELECT courses.name FROM timetables JOIN courses ON timetables.course_id = courses.id WHERE timetables.student_id = ${student_id}`,
        (err, rows) => { // Vulnerable to SQL Injection
            if (err) {
                res.status(500).send('Error fetching timetable from the database.');
            } else {
                res.json(rows);
            }
        }
    );
});

// View Assignments
router.get('/viewAssignments', (req, res) => {
    const { student_id } = req.query;
    db.all(
        `SELECT assignments.title, assignments.description FROM timetables 
         JOIN assignments ON timetables.course_id = assignments.course_id 
         WHERE timetables.student_id = ${student_id}`,
        (err, rows) => {
            if (err) {
                res.status(500).send('Error fetching assignments.');
            } else {
                res.json(rows);
            }
        }
    );
});


module.exports = router;
