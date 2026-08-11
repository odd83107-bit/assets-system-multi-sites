const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'draft',
    street_address TEXT,
    city TEXT,
    rooms REAL,
    floor INTEGER,
    total_floors INTEGER,
    price INTEGER,
    description TEXT,
    photos TEXT,
    platforms TEXT
  )
`);

function createApartment(data) {
  const stmt = db.prepare(`
    INSERT INTO apartments (street_address, city, rooms, floor, total_floors, price, description, photos, platforms, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    data.street_address,
    data.city,
    data.rooms,
    data.floor,
    data.total_floors,
    data.price,
    data.description,
    JSON.stringify(data.photos || []),
    JSON.stringify(data.platforms || []),
    data.status || 'draft'
  );
  return info.lastInsertRowid;
}

function getApartments() {
  return db.prepare('SELECT * FROM apartments ORDER BY created_at DESC').all().map(format);
}

function getApartment(id) {
  const row = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
  return row ? format(row) : null;
}

function updateApartment(id, data) {
  const stmt = db.prepare(`
    UPDATE apartments SET
      street_address = ?, city = ?, rooms = ?, floor = ?, total_floors = ?, price = ?, description = ?, photos = ?, platforms = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = stmt.run(
    data.street_address,
    data.city,
    data.rooms,
    data.floor,
    data.total_floors,
    data.price,
    data.description,
    JSON.stringify(data.photos || []),
    JSON.stringify(data.platforms || []),
    data.status || 'draft',
    id
  );
  return result.changes > 0;
}

function deleteApartment(id) {
  const result = db.prepare('DELETE FROM apartments WHERE id = ?').run(id);
  return result.changes > 0;
}

function setApartmentStatus(id, status) {
  const result = db.prepare('UPDATE apartments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  return result.changes > 0;
}

function format(row) {
  return {
    ...row,
    photos: JSON.parse(row.photos || '[]'),
    platforms: JSON.parse(row.platforms || '[]')
  };
}

module.exports = {
  createApartment,
  getApartments,
  getApartment,
  updateApartment,
  deleteApartment,
  setApartmentStatus
};
