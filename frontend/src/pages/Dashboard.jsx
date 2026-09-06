import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock3, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const label = g => ({
  'weight-loss': 'Weight Loss', 'weight-gain': 'Weight Gain', 'stress-relief': 'Stress Relief',
  'better-sleep': 'Better Sleep', flexibility: 'Flexibility', strength: 'Strength',
  meditation: 'Meditation & Mindfulness', posture: 'Posture Improvement',
  'general-fitness': 'General Fitness'
}[g] || 'General Wellness');

const goalCopy = {
  'weight-loss': 'Focus on active movement, core work, mobility and sustainable consistency. Yoga supports healthy habits; it does not guarantee weight loss.',
  'weight-gain': 'Focus on strength-oriented yoga, mobility and recovery alongside your broader wellness routine. Yoga alone does not guarantee weight gain.',
  flexibility: 'Build comfortable range of motion with gradual mobility and consistent practice.',
  strength: 'Develop controlled strength, stability and body awareness with progressive practice.',
  'stress-relief': 'Create calmer routines with gentle movement, breathing and mindful pauses.',
  'better-sleep': 'Use restorative movement and breathing to create a relaxing pre-sleep routine.',
  meditation: 'Pair gentle movement with breathing and mindfulness to support a calmer practice.',
  posture: 'Build body awareness with spine, shoulder and core-focused movement.',
  'general-fitness': 'Build a balanced practice across mobility, strength, recovery and consistency.'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [plan, setPlan] = useState();
  const [progress, setProgress] = useState();
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/plans'),
      api.get('/progress'),
      api.get('/yoga/poses', { params: { goal: user?.goal || '', difficulty: user?.experienceLevel || '', duration: user?.preferredDuration || 20 } })
    ])
      .then(([planRes, progressRes, yogaRes]) => {
        setPlan(planRes.data.plan);
        setProgress(progressRes.data.progress);
        const completedPoseIds = new Set(
          (progressRes.data.sessions || []).flatMap(s => (s.poses || []).map(p => String(p?._id || p)))
        );
        const poses = (yogaRes.data.poses || []).filter(p => !completedPoseIds.has(String(p._id))).slice(0, 3);
        setRecommendations(poses.length ? poses : (yogaRes.data.poses || []).slice(0, 3));
      })
      .catch(() => setError('We could not load your dashboard right now. Please refresh and try again.'));
  }, [user?.goal, user?.experienceLevel, user?.preferredDuration]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayPlan = plan?.weeklySchedule?.find(x => x.day === todayName);

  return <div className="page">
    <div className="welcome"><div><span className="eyebrow">YOUR DAILY PRACTICE</span><h1>{greeting}, {user?.name?.split(' ')[0]} 👋</h1><p>Ready for today's practice?</p></div><Link className="ask-pill" to="/chat"><Sparkles size={17}/> Ask Yoga Jenny</Link></div>
    {error && <div className="error-banner" role="alert">{error}</div>}
    <div className="dashboard-grid">
      <section className="today-card card"><div className="card-head"><span>Today's Yoga Session</span><span className="tag">{todayPlan?.difficulty || user?.experienceLevel || 'beginner'}</span></div><h2>{todayPlan?.sessionName || 'Your personalized flow'}</h2><p>{todayPlan?.focus || 'A balanced practice built around your goal.'}</p><div className="meta"><span><Clock3 size={16}/>{todayPlan?.duration || user?.preferredDuration || 20} min</span><span>•</span><span>{todayPlan?.status === 'rest' ? 'Recovery' : `${todayPlan?.poses?.length || 4} poses`}</span></div><Link className="btn" to="/plan">View & Start <ArrowRight size={17}/></Link></section>
      <section className="goal-card card"><span className="eyebrow">YOUR GOAL</span><div className="goal-orb">✦</div><h2>{label(user?.goal)}</h2><p>{goalCopy[user?.goal] || goalCopy['general-fitness']}</p></section>
      <section className="streak-card card"><div className="stat-icon"><Flame size={20}/></div><span className="eyebrow">CURRENT STREAK</span><strong>{progress?.currentStreak || 0} days</strong><p>Consistency over intensity.</p></section>
      <section className="progress-card card"><div className="card-head"><h3>This week's progress</h3><Link to="/progress">Details</Link></div><div className="week-bars">{['M','T','W','T','F','S','S'].map((d, i) => <div key={i}><div className="bar"><i style={{ height: `${Math.min(100, (progress?.weeklyProgress?.[i] || 0) / Math.max(1, user?.preferredDuration || 20) * 100)}%` }}/></div><small>{d}</small></div>)}</div></section>
    </div>
    <section className="mini-section"><div className="card-head"><h2>Recommended for you</h2><Link to="/explore">Explore all <ArrowRight size={15}/></Link></div><div className="recommend-row">
      {recommendations.map(p => <Link className="recommend" to={`/pose/${p._id}`} key={p._id}><div className="recommend-img">{p.imageUrl ? <img src={p.imageUrl} alt=""/> : '🧘'}</div><div><b>{p.name}</b><span>{p.duration} min · {p.difficulty}</span></div></Link>)}
      {!recommendations.length && <div className="empty">Personalized recommendations will appear here once your yoga library is available.</div>}
    </div></section>
  </div>;
}
