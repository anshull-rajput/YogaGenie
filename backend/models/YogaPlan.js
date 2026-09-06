import mongoose from 'mongoose';
const item=new mongoose.Schema({day:String,sessionName:String,duration:Number,difficulty:String,focus:String,poses:[{type:mongoose.Schema.Types.ObjectId,ref:'YogaPose'}],status:{type:String,enum:['planned','completed','rest'],default:'planned'}},{_id:false});
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},goal:String,duration:Number,weeklySchedule:[item],createdAt:{type:Date,default:Date.now},active:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model('YogaPlan',schema);
