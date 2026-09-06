import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import auth from './routes/auth.js';
import users from './routes/users.js';
import goals from './routes/goals.js';
import yoga from './routes/yoga.js';
import plans from './routes/plans.js';
import sessions from './routes/sessions.js';
import progress from './routes/progress.js';
import ai from './routes/ai.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'YogaGenie API' }));
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/goals', goals);
app.use('/api/yoga', yoga);
app.use('/api/plans', plans);
app.use('/api/sessions', sessions);
app.use('/api/progress', progress);
app.use('/api/ai', ai);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`YogaGenie API listening on ${port}`)))
  .catch(e => { console.error('Startup failed', e); process.exit(1); });
