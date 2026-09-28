import mongoose from "mongoose";
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,minlength:3},email:{type:String,required:true,unique:true,lowercase:true,trim:true},passwordHash:{type:String,required:true},role:{type:String,enum:["admin","faculty"],default:"admin"}},{timestamps:true});
export default mongoose.model("User",schema);
