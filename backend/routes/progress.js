import express from 'express';
import { auth } from '../middleware/auth.js';
import Progress from '../models/Progress.js';
import Session from '../models/Session.js';

const r = express.Router();
r.use(auth);

r.get('/', async (req, res) => {
  try {
    let p = await Progress.findOne({ userId: req.user._id });
    if (!p) p = await Progress.create({ userId: req.user._id });
    const sessions = await Session.find({ userId: req.user._id, completed: true }).sort({ completedAt: -1 });
    res.json({ progress: p, sessions });
  } catch {
    res.status(500).json({ message: 'Unable to load progress.' });
  }
});

r.get('/streak', async (req, res) => {
  try {
    const p = await Progress.findOne({ userId: req.user._id });
    res.json({ currentStreak: p?.currentStreak || 0, longestStreak: p?.longestStreak || 0 });
  } catch {
    res.status(500).json({ message: 'Unable to load streak.' });
  }
});

r.get('/monthly', async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;
    if (month < 1 || month > 12 || year < 2000 || year > 2100) return res.status(400).json({ message: 'Invalid month or year.' });
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const sessions = await Session.find({ userId: req.user._id, completed: true, completedAt: { $gte: start, $lt: end } }).sort({ completedAt: 1 });
    const days = new Date(year, month, 0).getDate();
    const minutes = Array(days).fill(0);
    sessions.forEach(s => {
      const day = new Date(s.completedAt).getDate();
      minutes[day - 1] += Number(s.duration) || 0;
    });
    res.json({ year, month, sessions: sessions.length, totalMinutes: minutes.reduce((a, b) => a + b, 0), dailyMinutes: minutes });
  } catch {
    res.status(500).json({ message: 'Unable to load monthly progress.' });
  }
});

export default r;
