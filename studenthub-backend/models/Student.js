import mongoose from "mongoose";
const schema=new mongoose.Schema({studentId:{type:String,required:true,unique:true,trim:true},name:{type:String,required:true,trim:true},email:{type:String,required:true,trim:true,lowercase:true},phone:{type:String,default:"",trim:true},department:{type:String,required:true,trim:true},course:{type:String,required:true,trim:true},year:{type:String,required:true,trim:true},section:{type:String,default:"",trim:true},attendance:{type:Number,min:0,max:100,default:0}},{timestamps:true});
export default mongoose.model("Student",schema);
