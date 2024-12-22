const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./school.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

const initializeDatabase = () => {
    // Drop old tables to ensure we have a clean slate
    db.serialize(() => {
        db.run(`DROP TABLE IF EXISTS timetables;`);
        db.run(`DROP TABLE IF EXISTS users;`);
        db.run(`DROP TABLE IF EXISTS courses;`);
        db.run(`DROP TABLE IF EXISTS assignments;`);

        // USERS Table
        //  user_id: internal PK
        //  username: unique login
        //  password: plain text (insecure for demonstration)
        //  role: must be 'student', 'teacher', or 'admin'
        //  teacher_id: unique numeric ID only if role='teacher'
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('student','teacher','admin')),
                teacher_id INTEGER UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // COURSES Table
        //  course_name: text PK
        //  teacher_id: references a teacher's numeric ID in users(teacher_id)
        db.run(`
            CREATE TABLE IF NOT EXISTS courses (
                course_name TEXT PRIMARY KEY,
                teacher_id INTEGER,
                FOREIGN KEY (teacher_id) REFERENCES users (teacher_id)
            )
        `);

        // ASSIGNMENTS Table
        //  assignment_id: auto PK
        //  course_name: references courses(course_name)
        //  title, description: assignment details
        db.run(`
            CREATE TABLE IF NOT EXISTS assignments (
                assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_name TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                FOREIGN KEY (course_name) REFERENCES courses(course_name) ON DELETE CASCADE
            )
        `);

        console.log('Database schema initialized or updated successfully.');
    });
};

module.exports = { db, initializeDatabase };
