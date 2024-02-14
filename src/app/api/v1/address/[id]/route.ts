import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db: {
  run(arg0: string, id: any): unknown; 
  all: (arg0: string) => any; 
} | null = null;

export async function DELETE(req: any, res: any) {
  if (!db) {
    db = await open({
      filename: "database.db",
      driver: sqlite3.Database,
    });
  }

  const { id } = await req.json();

  await db.run("DELETE FROM addresses WHERE id = ?", id);

  // Set the status and headers using the Response constructor
  return new Response(
    JSON.stringify({ message: "success" }),
    {
      status: 200,
    }
  );
}

export async function PATCH(req:any, res:any) {
  if (!db) {
    db = await open({
      filename: "database.db",
      driver: sqlite3.Database,
    });
  }

  const { id, isCurrentLocation } = await req.json();

  await db.run("UPDATE addresses SET isCurrentLocation = ? WHERE id = ?", [isCurrentLocation,id]);
  
  return new Response(
    JSON.stringify({ message: "success" }),
    {
      status: 200,
    }
  );
}
