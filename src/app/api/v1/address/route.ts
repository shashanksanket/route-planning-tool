import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db: {
  get(arg0: string, arg1?:string[]): unknown;
  exec(arg0: string): unknown;
  run(arg0: string, arg1: any[]): unknown; all: (arg0: string) => any; 
} | null = null;

async function createTable() {
  if (!db) {
    db = await open({
      filename: "database.db",
      driver: sqlite3.Database,
    });
  }

  // Check if the "addresses" table exists
  const tableExists = await db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='addresses'"
  );
  console.log(tableExists)
  // If the table does not exist, create it
  if (!tableExists) {
    await db.exec(`
      CREATE TABLE addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        isCurrentLocation BOOLEAN NOT NULL
      )
    `);
  }
}

createTable();

export async function GET(req: any, res: any) {
  if (!db) {
    db = await open({
      filename: "database.db",
      driver: sqlite3.Database,
    });
  }

  const addressList = await db.all("SELECT * FROM addresses");

  // Add CORS headers to the response
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  return res.status(200).json(addressList);
}

export async function POST(req: any, res: any) {
  if (!db) {
    db = await open({
      filename: "database.db",
      driver: sqlite3.Database,
    });
  }

  const { location, latitude, longitude, isCurrentLocation } = await req.json();

  try {
    const existingEntry = await db.get("SELECT * FROM addresses WHERE location = ?", [location]);
    if (existingEntry) {
      // Add CORS headers to the response
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Requested-With");
      res.setHeader("Access-Control-Allow-Credentials", "true");

      return res.status(400).json({ message: "Location already exists in the database" });
    }

    await db.run(
      "INSERT INTO addresses (location, latitude, longitude, isCurrentLocation) VALUES (?,?,?,?)",
      [location, latitude, longitude, isCurrentLocation]
    );

    // Add CORS headers to the response
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.error("Error while processing POST request:", error);
    
    // Add CORS headers to the response
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    return res.status(500).json({ message: "Internal Server Error" });
  }
}
