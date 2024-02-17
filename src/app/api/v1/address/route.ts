import { MongoClient, Db } from 'mongodb';
import { ObjectId } from 'mongoose';

let db: Db | null = null;
const options: any = {
  retryWrites: true,
  w: "majority",
};
async function connectToDataBase() {
  try {
    if (!db) {
      const uri = process.env.MONGODB_URI;
      const client = new MongoClient(uri!, options);
      await client.connect();
      db = client.db(); // Use your database name if it's not the default one
      console.log("Connected to MongoDB");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow error for the caller to handle
  }
}

export async function GET(req: any, res: any) {
  try {
    await connectToDataBase();

    const addressList = await db!.collection("addresses").find().toArray();

    return new Response(JSON.stringify(addressList), {
      status: 200,
    });
  } catch (error) {
    console.error("Error while retrieving data from MongoDB:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: any, res: any) {
  try {
    await connectToDataBase();

    const { location, latitude, longitude, isCurrentLocation } = await req.json();

    const existingEntry = await db!.collection("addresses").findOne({ location });

    if (existingEntry) {
      return new Response(
        JSON.stringify({ message: "Location already exists in the database" }),
        {
          status: 400,
        }
      );
    }

    await db!.collection("addresses").insertOne({
      location,
      latitude,
      longitude,
      isCurrentLocation
    });

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

export async function DELETE(req: any, res: any) {
  try {
    await connectToDataBase();

    const { id } = await req.json();

    const deletedEntry:any = await db!.collection("addresses").findOneAndDelete({ _id: id as ObjectId });

    if (!deletedEntry.value) {
      return new Response(
        JSON.stringify({ message: "Address not found" }),
        {
          status: 404,
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Address deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error while processing DELETE request:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}
