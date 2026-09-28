import mongoose from "mongoose";
const schema=new mongoose.Schema({attendanceId:{type:String,required:true,unique:true,trim:true},studentId:{type:String,required:true,trim:true,index:true},subjectId:{type:String,required:true,trim:true,index:true},date:{type:String,required:true,trim:true},status:{type:String,enum:["Present","Absent"],required:true}},{timestamps:true});
schema.index({studentId:1,subjectId:1,date:1},{unique:true});
export default mongoose.model("Attendance",schema);
