import mongoose from 'mongoose';
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',unique:true,required:true},totalSessions:{type:Number,default:0},totalMinutes:{type:Number,default:0},currentStreak:{type:Number,default:0},longestStreak:{type:Number,default:0},lastCompletedDate:Date,weeklyProgress:{type:[Number],default:[0,0,0,0,0,0,0]}},{timestamps:true});
export default mongoose.model('Progress',schema);
