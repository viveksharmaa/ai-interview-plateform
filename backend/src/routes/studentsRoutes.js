const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();

const DATA_DIR = path.join(__dirname, '../../../database');
const DATA_FILE = path.join(DATA_DIR, 'students.json');
const DB_FILE = path.join(DATA_DIR, 'students.db');

let db;

async function ensureDb() {
  if (db) return;
  await fs.mkdir(DATA_DIR, { recursive: true });

  db = new sqlite3.Database(DB_FILE);

  // Promisify run/get/all
  db.runAsync = function (sql, params=[]) {
    return new Promise((resolve, reject) => {
      this.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });
  };
  db.getAsync = function (sql, params=[]) {
    return new Promise((resolve, reject) => {
      this.get(sql, params, function (err, row) {
        if (err) return reject(err);
        resolve(row);
      });
    });
  };
  db.allAsync = function (sql, params=[]) {
    return new Promise((resolve, reject) => {
      this.all(sql, params, function (err, rows) {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  };

  // Create table if missing
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      roll_no TEXT UNIQUE,
      email TEXT UNIQUE,
      course TEXT,
      year INTEGER,
      grade TEXT,
      created_at TEXT
    )
  `);

  // Sync from JSON if JSON exists and DB empty
  const rows = await db.allAsync('SELECT COUNT(1) as cnt FROM students');
  if (rows && rows[0] && rows[0].cnt === 0) {
    try {
      const json = await readStudentsJson();
      if (Array.isArray(json) && json.length) {
        const insertStmt = `INSERT OR REPLACE INTO students (id,name,roll_no,email,course,year,grade,created_at) VALUES (?,?,?,?,?,?,?,?)`;
        for (const s of json) {
          await db.runAsync(insertStmt, [s.id, s.name, s.roll_no, s.email, s.course, s.year, s.grade, s.created_at]);
        }
      }
    } catch (err) {
      // ignore
    }
  }
}

async function readStudentsJson() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeStudentsJson(list) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
}

async function writeJsonFromDb() {
  await ensureDb();
  const rows = await db.allAsync('SELECT * FROM students ORDER BY created_at DESC');
  await writeStudentsJson(rows);
}

// GET /api/students - list students (from sqlite)
router.get('/', async (req, res) => {
  try {
    await ensureDb();
    const students = await db.allAsync('SELECT * FROM students ORDER BY created_at DESC');
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    console.error('students GET error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    await ensureDb();
    const id = req.params.id;
    const student = await db.getAsync('SELECT * FROM students WHERE id = ?', [id]);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    console.error('students GET:id error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/students - create student
router.post('/', async (req, res) => {
  try {
    await ensureDb();
    const { name, roll_no, email, course, year, grade } = req.body;

    if (!name || !roll_no || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, roll_no, email' });
    }

    // uniqueness checks in db
    const existsRoll = await db.getAsync('SELECT id FROM students WHERE roll_no = ?', [roll_no]);
    if (existsRoll) return res.status(400).json({ success: false, message: 'Roll number already exists' });
    const existsEmail = await db.getAsync('SELECT id FROM students WHERE email = ?', [email]);
    if (existsEmail) return res.status(400).json({ success: false, message: 'Email already exists' });

    const id = 's' + Date.now();
    const created_at = new Date().toISOString();

    await db.runAsync('INSERT INTO students (id,name,roll_no,email,course,year,grade,created_at) VALUES (?,?,?,?,?,?,?,?)', [id, name, roll_no, email, course || '', year ? Number(year) : null, grade || '', created_at]);

    // update JSON mirror
    await writeJsonFromDb();

    const created = await db.getAsync('SELECT * FROM students WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('students POST error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/students/:id - update
router.put('/:id', async (req, res) => {
  try {
    await ensureDb();
    const id = req.params.id;
    const { name, roll_no, email, course, year, grade } = req.body;

    const existing = await db.getAsync('SELECT * FROM students WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Student not found' });

    // uniqueness checks for roll_no/email if changed
    if (roll_no && roll_no !== existing.roll_no) {
      const r = await db.getAsync('SELECT id FROM students WHERE roll_no = ?', [roll_no]);
      if (r) return res.status(400).json({ success: false, message: 'Roll number already exists' });
    }
    if (email && email !== existing.email) {
      const e = await db.getAsync('SELECT id FROM students WHERE email = ?', [email]);
      if (e) return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    await db.runAsync('UPDATE students SET name=?, roll_no=?, email=?, course=?, year=?, grade=? WHERE id = ?', [
      name || existing.name,
      roll_no || existing.roll_no,
      email || existing.email,
      course !== undefined ? course : existing.course,
      year !== undefined ? (year ? Number(year) : null) : existing.year,
      grade !== undefined ? grade : existing.grade,
      id,
    ]);

    await writeJsonFromDb();

    const updated = await db.getAsync('SELECT * FROM students WHERE id = ?', [id]);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error('students PUT error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  try {
    await ensureDb();
    const id = req.params.id;
    const existing = await db.getAsync('SELECT * FROM students WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Student not found' });

    await db.runAsync('DELETE FROM students WHERE id = ?', [id]);
    await writeJsonFromDb();

    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('students DELETE error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
