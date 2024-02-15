import mongoose, { ConnectOptions } from "mongoose";

let uri = process.env.MONGODB_URI;
let isConnected = false;

export const connectToDataBase = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("DB connected already");
    return;
  }
  const options: any = {
    retryWrites: true,
    w: "majority",
  };
  try {
    if (uri) {
      await mongoose.connect(uri, options)
    }
    isConnected = true;
    console.log("database connected successfully")
  } catch (error) {
    console.log(error);
  }
};
