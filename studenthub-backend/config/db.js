import mongoose from "mongoose";
export default async function connectDB(){
  const uri=process.env.MONGO_URI;
  if(!uri || uri==="YOUR_MONGODB_ATLAS_CONNECTION_STRING") throw new Error("MONGO_URI is missing. Create .env and add your MongoDB Atlas connection string.");
  const connection=await mongoose.connect(uri);
  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
}
