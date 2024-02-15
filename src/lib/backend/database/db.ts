import path from "path";
import sqlite3 from "sqlite3";

const databasePath = path.join(process.cwd(), 'database.db')

const db = new sqlite3.Database(
  databasePath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to the SQLite database.");
    }
  }
);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS address(
        id INTEGER PRIMARY KEY,
        location TEXT,
        longitude NUMBER,
        latitude NUMBER
        isCurrentLocation BOOLEAN
        )`,
    (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log("Created addresses table");
      }
    }
  );
});

export default db;
