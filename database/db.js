const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'landing.db');
const rawDb = new sqlite3.Database(dbPath);

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

rawDb.serialize(() => {
    rawDb.exec(schema);

    const siteName = process.env.SITE_NAME;
    if (siteName) {
        rawDb.run("UPDATE site_settings SET value = ? WHERE key = 'business_name' AND value = 'Tu Marca'", [siteName]);
    }

    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin1234';

    rawDb.get('SELECT * FROM users WHERE username = ?', [adminUser], (err, user) => {
        if (!user) {
            const hash = bcrypt.hashSync(adminPass, 10);
            rawDb.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [adminUser, hash]);
            console.log(`[DB] Usuario administrador listo: ${adminUser}`);
        }
    });
});

const db = {
    prepare(sql) {
        return {
            all(...params) {
                return new Promise((resolve, reject) => {
                    rawDb.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
            },
            get(...params) {
                return new Promise((resolve, reject) => {
                    rawDb.get(sql, params, (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            },
            run(...params) {
                return new Promise((resolve, reject) => {
                    rawDb.run(sql, params, function(err) {
                        if (err) reject(err);
                        else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
                    });
                });
            }
        };
    }
};

module.exports = db;
