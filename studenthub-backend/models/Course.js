import mongoose from "mongoose";
const schema=new mongoose.Schema({courseId:{type:String,required:true,unique:true,trim:true},name:{type:String,required:true,trim:true},code:{type:String,required:true,trim:true,uppercase:true},department:{type:String,required:true,trim:true},duration:{type:String,required:true,trim:true}},{timestamps:true});
export default mongoose.model("Course",schema);
