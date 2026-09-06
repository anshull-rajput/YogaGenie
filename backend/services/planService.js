import YogaPlan from '../models/YogaPlan.js';
import YogaPose from '../models/YogaPose.js';
const GOAL_FOCUS={'weight-loss':'active movement, core & mobility','weight-gain':'strength, mobility & recovery','flexibility':'mobility & flexibility','strength':'strength & stability','stress-relief':'gentle flow & breathing','better-sleep':'restorative flow & breathing','general-fitness':'full-body flow','meditation':'breathing & mindfulness','posture':'spine, shoulder & core awareness'};
const BREATHING={morning:['3 minutes comfortable diaphragmatic breathing'],afternoon:['2 minutes slow nasal breathing'],evening:['4 minutes slow breathing with a longer relaxed exhale'],flexible:['3 minutes comfortable mindful breathing']};
export async function generatePlan(user){
 const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
 const n=Math.max(1,Math.min(7,user.preferences?.daysPerWeek||5));
 const d=Math.max(10,Math.min(60,user.preferredDuration||20));
 const goal=user.goal||'general-fitness'; const level=user.experienceLevel||'beginner';
 const preferredStyles=user.preferences?.styles||[]; const focusAreas=user.preferences?.focusAreas||[];
 const query={difficulty:level,goals:goal}; if(preferredStyles.length) query.style={$in:preferredStyles};
 let pool=await YogaPose.find(query).limit(20); if(!pool.length) pool=await YogaPose.find({difficulty:level,goals:goal}).limit(20); if(!pool.length) pool=await YogaPose.find({difficulty:level}).limit(20);
 const sessionTypes=['Warm-up + Mobility','Main Flow','Strength & Stability','Mobility + Balance','Full-Body Flow','Recovery + Breathwork','Mindful Flow'];
 const schedule=days.map((day,i)=>{
   if(i>=n)return{day,sessionName:'Recovery / Rest',duration:0,difficulty:level,focus:'Recovery',warmUp:[],mainPractice:[],coolDown:[],breathing:[],poses:[],status:'rest'};
   const count=Math.min(6,Math.max(3,Math.round(d/6))); const poses=Array.from({length:count},(_,k)=>pool[(i+k)%Math.max(1,pool.length)]?._id).filter(Boolean);
   const names=poses.map(id=>{const p=pool.find(x=>String(x._id)===String(id));return p?.name}).filter(Boolean);
   const warmUp=names.slice(0,Math.min(2,names.length)); const mainPractice=names.slice(0,Math.max(1,names.length-2)); const coolDown=names.slice(-2);
   const focus=focusAreas.length?focusAreas.join(', '):GOAL_FOCUS[goal];
   return{day,sessionName:`${d}-minute ${level} ${sessionTypes[i]}`,duration:d,difficulty:level,focus,warmUp,mainPractice,coolDown,breathing:BREATHING[user.preferredTime]||BREATHING.flexible,poses,status:'planned'};
 });
 return YogaPlan.create({userId:user._id,goal,duration:d,weeklySchedule:schedule});
}
