import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/army", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
export default connectDb;
