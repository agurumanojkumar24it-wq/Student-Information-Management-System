import mongoose from "mongoose";
const schema=new mongoose.Schema({subjectId:{type:String,required:true,unique:true,trim:true},name:{type:String,required:true,trim:true},code:{type:String,required:true,trim:true,uppercase:true},course:{type:String,required:true,trim:true},semester:{type:String,required:true,trim:true},faculty:{type:String,default:"",trim:true}},{timestamps:true});
export default mongoose.model("Subject",schema);
