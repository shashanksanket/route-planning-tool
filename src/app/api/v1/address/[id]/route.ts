import { MongoClient, Db, ObjectId } from 'mongodb';

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
      db = client.db(); 
      console.log("Connected to MongoDB");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; 
  }
}

export async function DELETE(req: any, res: any) {
  try {
    await connectToDataBase();

    const { _id } = await req.json();
    console.log("here inside abckend",_id)
    const deletedEntry = await db!.collection("addresses").findOneAndDelete({ _id: new ObjectId(_id) });

    console.log(deletedEntry)
    return new Response(
      JSON.stringify({ message: "success" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting document from MongoDB:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(req: any, res: any) {
  try {
    await connectToDataBase();

    const { id, isCurrentLocation } = await req.json();

    await db!.collection("addresses").updateOne(
      { _id: id as ObjectId },
      { $set: { isCurrentLocation } }
    );

    return new Response(
      JSON.stringify({ message: "success" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating document in MongoDB:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
      }
    );
  }
}
