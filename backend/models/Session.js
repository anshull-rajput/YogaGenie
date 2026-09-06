import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},planId:{type:mongoose.Schema.Types.ObjectId,ref:'YogaPlan'},startedAt:Date,completedAt:Date,duration:{type:Number,default:0},poses:[{type:mongoose.Schema.Types.ObjectId,ref:'YogaPose'}],completed:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('Session',schema);
