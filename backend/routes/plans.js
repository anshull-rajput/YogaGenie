import express from 'express';
import { auth } from '../middleware/auth.js';
import YogaPlan from '../models/YogaPlan.js';
import { generatePlan } from '../services/planService.js';

const r = express.Router();
r.use(auth);

const withPoses = query => query.populate('weeklySchedule.poses');

r.get('/', async (req, res) => {
  try {
    const plan = await withPoses(YogaPlan.findOne({ userId: req.user._id, active: true }));
    res.json({ plan });
  } catch {
    res.status(500).json({ message: 'Unable to load your plan.' });
  }
});

r.get('/:id', async (req, res) => {
  try {
    const plan = await withPoses(YogaPlan.findOne({ _id: req.params.id, userId: req.user._id }));
    if (!plan) return res.status(404).json({ message: 'Plan not found.' });
    res.json({ plan });
  } catch {
    res.status(400).json({ message: 'Invalid plan.' });
  }
});

r.post('/generate', async (req, res) => {
  try {
    await YogaPlan.updateMany({ userId: req.user._id, active: true }, { active: false });
    const created = await generatePlan(req.user);
    const plan = await withPoses(YogaPlan.findById(created._id));
    res.status(201).json({ plan });
  } catch {
    res.status(500).json({ message: 'Could not generate plan' });
  }
});

export default r;
