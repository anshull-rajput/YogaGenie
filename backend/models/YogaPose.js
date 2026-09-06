import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true},sanskritName:String,description:String,instructions:[String],benefits:[String],precautions:[String],difficulty:{type:String,enum:['beginner','intermediate','advanced']},goals:[String],targetAreas:[String],duration:{type:Number,default:1},style:String,imageUrl:String,videoUrl:String},{timestamps:true});
export default mongoose.model('YogaPose',schema);
