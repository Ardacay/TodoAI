const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.resolve(__dirname, 'todoai.db');

// Create or open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Initialize tables
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);

            // Tasks table - We need to recreate it to add user_id properly or just add it. 
            // Since we agreed to a fresh start, let's drop and recreate to be clean.
            // db.run("DROP TABLE IF EXISTS tasks"); // Uncomment to wipe data

            // Or simplified: Create if not exists with user_id. 
            // Ideally we should migrate. For this task, I will try to ALTER TABLE first, if it fails (already exists), ignore.

            db.run(`CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                duration REAL,
                deadline TEXT,
                priority TEXT DEFAULT 'medium',
                dependencies TEXT,
                completed INTEGER DEFAULT 0,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);

            // Attempt to add user_id column if it doesn't exist (for existing DBs)
            // SQLite doesn't support IF NOT EXISTS for columns easily, so we can wrap in try/catch block logic or just ignore error
            db.run(`ALTER TABLE tasks ADD COLUMN user_id TEXT`, (err) => {
                // Ignore error if column already exists
            });
        });
    }
});

// Helper function to promote callback-based sqlite3 methods to Promises
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    db,
    run,
    get,
    all
};
