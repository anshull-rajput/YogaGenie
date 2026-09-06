import express from 'express';
import { auth } from '../middleware/auth.js';
import Session from '../models/Session.js';
import Progress from '../models/Progress.js';
const r=express.Router(); r.use(auth);
r.get('/history',async(req,res)=>res.json({sessions:await Session.find({userId:req.user._id,completed:true}).sort({completedAt:-1}).limit(100)}));
r.post('/start',async(req,res)=>{const s=await Session.create({userId:req.user._id,planId:req.body.planId,startedAt:new Date(),poses:req.body.poses||[]});res.status(201).json({session:s})});
r.post('/complete',async(req,res)=>{try{const s=await Session.findOne({_id:req.body.sessionId,userId:req.user._id});if(!s)return res.status(404).json({message:'Session not found'});s.completed=true;s.completedAt=new Date();s.duration=Math.max(0,Number(req.body.duration)||0);await s.save();let p=await Progress.findOne({userId:req.user._id});if(!p)p=await Progress.create({userId:req.user._id});const day=new Date().getDay(),idx=(day+6)%7;p.totalSessions+=1;p.totalMinutes+=s.duration;const today=new Date();today.setHours(0,0,0,0);if(p.lastCompletedDate){const last=new Date(p.lastCompletedDate);last.setHours(0,0,0,0);const diff=Math.round((today-last)/86400000);p.currentStreak=diff===0?p.currentStreak:diff===1?p.currentStreak+1:1}else p.currentStreak=1;p.longestStreak=Math.max(p.longestStreak,p.currentStreak);p.lastCompletedDate=new Date();p.weeklyProgress[idx]=(p.weeklyProgress[idx]||0)+s.duration;await p.save();res.json({session:s,progress:p})}catch(e){res.status(400).json({message:'Could not complete session'})}});
export default r;
