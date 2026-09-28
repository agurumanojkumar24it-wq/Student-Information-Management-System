import mongoose from "mongoose";
const schema=new mongoose.Schema({markId:{type:String,required:true,unique:true,trim:true},studentId:{type:String,required:true,trim:true,index:true},subject:{type:String,required:true,trim:true},assessmentType:{type:String,default:"Internal",trim:true},marks:{type:Number,required:true,min:0,max:100}},{timestamps:true});
export default mongoose.model("Mark",schema);
