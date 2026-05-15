import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("Connected to MongoDB Database Successfully ):");
      })
      .catch((error) => {
        console.log("Error connecting to MongoDB Database:", error);
      });
  } catch (error) {
    console.log("Error connecting to MongoDB Database:", error);
  }
};

export default dbConnect;
