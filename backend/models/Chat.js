import mongoose from 'mongoose';
const message=new mongoose.Schema({role:{type:String,enum:['user','assistant'],required:true},content:{type:String,required:true},sources:[String]},{_id:false});
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},messages:[message]},{timestamps:true});
export default mongoose.model('Chat',schema);
