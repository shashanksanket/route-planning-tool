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

  return new Response(JSON.stringify(addressList), {
    status: 200,
  });
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
      return new Response(
        JSON.stringify({ message: "Location already exists in the database" }),
        {
          status: 400,
        }
      );
    }

    await db.run(
      "INSERT INTO addresses (location, latitude, longitude, isCurrentLocation) VALUES (?,?,?,?)",
      [location, latitude, longitude, isCurrentLocation]
    );

    return new Response(
      JSON.stringify({ message: "success" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error while processing POST request:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}