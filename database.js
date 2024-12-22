const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./school.db', (err) => {
    if (err) {
        console.error('Error connecting to database (Secure Version):', err);
    } else {
        console.log('Connected to SQLite database (Secure Version).');
    }
});

const initializeDatabase = () => {
    db.serialize(() => {
        db.run(`DROP TABLE IF EXISTS timetables;`);
        db.run(`DROP TABLE IF EXISTS users;`);
        db.run(`DROP TABLE IF EXISTS courses;`);
        db.run(`DROP TABLE IF EXISTS assignments;`);

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,   -- Will store hashed password
                role TEXT NOT NULL CHECK(role IN ('student','teacher','admin')),
                teacher_id INTEGER UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS courses (
                course_name TEXT PRIMARY KEY,
                teacher_id INTEGER
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS assignments (
                assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_name TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY (course_name) REFERENCES courses(course_name) ON DELETE CASCADE
            )
        `);

        console.log('Database schema initialized (Secure Version).');
    });
};

module.exports = { db, initializeDatabase };
