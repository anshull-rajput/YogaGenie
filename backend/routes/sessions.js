import express from 'express';
import { auth } from '../middleware/auth.js';
import Session from '../models/Session.js';
import Progress from '../models/Progress.js';
import YogaPlan from '../models/YogaPlan.js';

const r = express.Router();
r.use(auth);

const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

r.get('/history', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id, completed: true })
      .sort({ completedAt: -1 }).limit(100).populate('poses', 'name sanskritName');
    res.json({ sessions });
  } catch {
    res.status(500).json({ message: 'Unable to load session history' });
  }
});

r.post('/start', async (req, res) => {
  try {
    const plan = await YogaPlan.findOne({ _id: req.body.planId, userId: req.user._id, active: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    const item = plan.weeklySchedule.find(x => x.day === req.body.day && x.status !== 'rest');
    if (!item) return res.status(400).json({ message: 'Choose a planned practice day' });
    const session = await Session.create({ userId: req.user._id, planId: plan._id, day: item.day, startedAt: new Date(), poses: item.poses });
    res.status(201).json({ session, practice: item });
  } catch {
    res.status(400).json({ message: 'Could not start session' });
  }
});

r.post('/complete', async (req, res) => {
  try {
    const s = await Session.findOne({ _id: req.body.sessionId, userId: req.user._id });
    if (!s) return res.status(404).json({ message: 'Session not found' });
    if (s.completed) return res.status(409).json({ message: 'Session is already completed' });

    s.completed = true;
    s.completedAt = new Date();
    s.duration = Math.min(180, Math.max(1, Number(req.body.duration) || 0));
    await s.save();

    const plan = s.planId ? await YogaPlan.findOne({ _id: s.planId, userId: req.user._id }) : null;
    if (plan && s.day) {
      const item = plan.weeklySchedule.find(x => x.day === s.day);
      if (item) item.status = 'completed';
      await plan.save();
    }

    let p = await Progress.findOne({ userId: req.user._id });
    if (!p) p = await Progress.create({ userId: req.user._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = p.lastCompletedDate ? new Date(p.lastCompletedDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    if (!last) p.currentStreak = 1;
    else {
      const diff = Math.round((today - last) / 86400000);
      if (diff === 0) p.currentStreak = Math.max(1, p.currentStreak);
      else if (diff === 1) p.currentStreak += 1;
      else p.currentStreak = 1;
    }

    const weekStart = startOfWeek(today);
    const storedWeek = p.weeklyProgressStart ? startOfWeek(p.weeklyProgressStart) : null;
    if (!storedWeek || storedWeek.getTime() !== weekStart.getTime()) {
      p.weeklyProgress = [0, 0, 0, 0, 0, 0, 0];
      p.weeklyProgressStart = weekStart;
    }

    p.longestStreak = Math.max(p.longestStreak || 0, p.currentStreak);
    p.totalSessions += 1;
    p.totalMinutes += s.duration;
    p.lastCompletedDate = new Date();
    p.weeklyProgress[(today.getDay() + 6) % 7] += s.duration;
    await p.save();

    res.json({ session: s, progress: p, plan });
  } catch {
    res.status(400).json({ message: 'Could not complete session' });
  }
});

export default r;
