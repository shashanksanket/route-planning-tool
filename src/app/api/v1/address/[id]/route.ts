import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
export const dynamic = "force-dynamic"
let db: {
  run(arg0: string, id: any): unknown; 
  all: (arg0: string) => any; 
} | null = null;

export async function DELETE(req: any, res: any) {
  if (!db) {
    const databasePath = path.join(process.cwd(), 'database.db')
    db = await open({
      filename: databasePath,
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
    const databasePath = path.join(process.cwd(), 'database.db')
    db = await open({
      filename: databasePath,
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
