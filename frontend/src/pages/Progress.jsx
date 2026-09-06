import { useEffect, useState } from 'react';
import { Flame, Clock3, CheckCircle2, CalendarDays } from 'lucide-react';
import api from '../services/api';
import '../progress.css';

export default function Progress() {
  const [p, setP] = useState();
  const [sessions, setSessions] = useState([]);
  const [monthly, setMonthly] = useState();
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    Promise.all([
      api.get('/progress'),
      api.get('/progress/monthly', { params: { year: now.getFullYear(), month: now.getMonth() + 1 } })
    ])
      .then(([progressRes, monthlyRes]) => {
        setP(progressRes.data.progress);
        setSessions(progressRes.data.sessions || []);
        setMonthly(monthlyRes.data);
      })
      .catch(() => setError('Unable to load your progress right now.'));
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekly = p?.weeklyProgress || [];
  const max = Math.max(1, ...weekly);
  const monthlyMax = Math.max(1, ...(monthly?.dailyMinutes || []));

  return (
    <div className="page">
      <div className="page-title">
        <div>
          <span className="eyebrow">YOUR PROGRESS</span>
          <h1>Small steps, lasting habits.</h1>
          <p>Track consistency without chasing perfection.</p>
        </div>
      </div>
      {error && <div className="error-banner" role="alert">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><Flame/><span>Current streak</span><strong>{p?.currentStreak || 0} days</strong></div>
        <div className="stat-card"><Flame/><span>Longest streak</span><strong>{p?.longestStreak || 0} days</strong></div>
        <div className="stat-card"><CheckCircle2/><span>Sessions completed</span><strong>{p?.totalSessions || 0}</strong></div>
        <div className="stat-card"><Clock3/><span>Total practice</span><strong>{p?.totalMinutes || 0} min</strong></div>
      </div>

      <section className="card progress-chart">
        <div className="card-head"><h2>Weekly practice</h2><span><CalendarDays size={15}/> Minutes</span></div>
        <div className="chart-bars">
          {days.map((d, i) => <div className="chart-day" key={d}>
            <div className="chart-track"><i style={{ height: `${Math.round(((weekly[i] || 0) / max) * 100)}%` }}/></div>
            <b>{weekly[i] || 0}</b><small>{d}</small>
          </div>)}
        </div>
      </section>

      <section className="card progress-chart">
        <div className="card-head">
          <div><h2>Monthly practice</h2><span>{monthly ? `${monthly.sessions} sessions · ${monthly.totalMinutes} min` : 'Loading…'}</span></div>
          <span><CalendarDays size={15}/> {new Date().toLocaleString('en-US', { month: 'long' })}</span>
        </div>
        <div className="month-bars">
          {(monthly?.dailyMinutes || []).map((minutes, i) => <div className="month-day" key={i} title={`${minutes} minutes on day ${i + 1}`}>
            <div className="month-track"><i style={{ height: `${Math.round((minutes / monthlyMax) * 100)}%` }}/></div>
            <small>{i + 1}</small>
          </div>)}
        </div>
      </section>

      <section className="card history">
        <h2>Practice history</h2>
        {sessions.length ? sessions.map(x => <div className="history-row" key={x._id}>
          <span><CheckCircle2 size={17}/> {x.day ? `${x.day} practice` : 'Session completed'}</span>
          <b>{x.duration} min</b>
          <small>{x.completedAt ? new Date(x.completedAt).toLocaleDateString() : '—'}</small>
        </div>) : <div className="empty">Complete your first session to start your progress history.</div>}
      </section>
    </div>
  );
}
