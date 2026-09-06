import express from 'express';

const r = express.Router();

const goals = [
  { id: 'weight-loss', name: 'Weight Loss', description: 'Support an active, consistent wellness routine.' },
  { id: 'weight-gain', name: 'Weight Gain', description: 'Support strength, recovery and mobility habits.' },
  { id: 'flexibility', name: 'Flexibility', description: 'Build comfortable mobility and range of motion.' },
  { id: 'strength', name: 'Strength', description: 'Build controlled strength and stability.' },
  { id: 'stress-relief', name: 'Stress Relief', description: 'Create calmer movement and breathing routines.' },
  { id: 'better-sleep', name: 'Better Sleep', description: 'Wind down with restorative movement and breathing.' },
  { id: 'general-fitness', name: 'General Fitness', description: 'Build a balanced yoga and wellness practice.' },
  { id: 'meditation', name: 'Meditation & Mindfulness', description: 'Pair movement with mindful breathing and awareness.' },
  { id: 'posture', name: 'Posture Improvement', description: 'Build posture awareness with spine, shoulder and core work.' }
];

r.get('/', (_req, res) => res.json({ goals }));

export default r;
