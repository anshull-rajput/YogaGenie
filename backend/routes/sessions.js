import express from 'express';
import { auth } from '../middleware/auth.js';
import Session from '../models/Session.js';
import Progress from '../models/Progress.js';

const r = express.Router();
r.use(auth);

r.get('/history', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id, completed: true })
      .sort({ completedAt: -1 })
      .limit(100);
    res.json({ sessions });
  } catch (e) {
    res.status(500).json({ message: 'Unable to load session history' });
  }
});

r.post('/start', async (req, res) => {
  try {
    const poses = Array.isArray(req.body.poses) ? req.body.poses : [];
    const session = await Session.create({
      userId: req.user._id,
      planId: req.body.planId,
      startedAt: new Date(),
      poses
    });
    res.status(201).json({ session });
  } catch (e) {
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
    s.duration = Math.min(180, Math.max(0, Number(req.body.duration) || 0));
    await s.save();

    let p = await Progress.findOne({ userId: req.user._id });
    if (!p) p = await Progress.create({ userId: req.user._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = p.lastCompletedDate ? new Date(p.lastCompletedDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    if (!last) p.currentStreak = 1;
    else {
      const diff = Math.round((today - last) / 86400000);
      if (diff === 0) {
        // Completing multiple sessions on the same day must not inflate the streak.
        p.currentStreak = Math.max(1, p.currentStreak);
      } else if (diff === 1) p.currentStreak += 1;
      else p.currentStreak = 1;
    }

    p.longestStreak = Math.max(p.longestStreak || 0, p.currentStreak);
    p.totalSessions += 1;
    p.totalMinutes += s.duration;
    p.lastCompletedDate = new Date();

    const day = new Date().getDay();
    const idx = (day + 6) % 7;
    p.weeklyProgress[idx] = (p.weeklyProgress[idx] || 0) + s.duration;
    await p.save();

    res.json({ session: s, progress: p });
  } catch (e) {
    res.status(400).json({ message: 'Could not complete session' });
  }
});

export default r;
