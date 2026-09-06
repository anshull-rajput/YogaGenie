import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, MessageCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function PoseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState();
  const [related, setRelated] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get(`/yoga/poses/${id}`)
      .then(async (r) => {
        if (!active) return;
        const pose = r.data.pose;
        setP(pose);
        try {
          const params = new URLSearchParams();
          if (pose.difficulty) params.set('difficulty', pose.difficulty);
          if (pose.style) params.set('style', pose.style);
          const rr = await api.get(`/yoga/poses?${params.toString()}`);
          if (active) setRelated((rr.data.poses || []).filter(x => x._id !== pose._id).slice(0, 3));
        } catch { /* related poses are optional */ }
      })
      .catch(() => active && setError('Unable to load this pose right now.'));
    return () => { active = false; };
  }, [id]);

  if (error) return <div className="screen-center"><div><p>{error}</p><Link className="btn" to="/explore">Back to Explore</Link></div></div>;
  if (!p) return <div className="screen-center">Loading pose…</div>;

  const ask = () => nav('/chat', { state: { pose: p.name } });

  return (
    <div className="page">
      <Link className="back" to="/explore"><ArrowLeft size={17} /> Back to Explore</Link>
      <div className="pose-detail">
        <div>
          <div className="pose-large">
            <img src={p.imageUrl} alt={`${p.name} yoga pose`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '26px' }} />
          </div>
          {p.videoUrl && (
            <a className="btn secondary" href={p.videoUrl} target="_blank" rel="noreferrer" style={{ marginTop: 12, display: 'inline-flex' }}>
              <PlayCircle size={17} /> Watch guidance
            </a>
          )}
        </div>
        <div>
          <span className="tag">{p.difficulty}</span>
          <h1>{p.name}</h1>
          <h3>{p.sanskritName}</h3>
          <p>{p.description}</p>
          <div className="detail-meta">
            {p.duration && <span><Clock3 size={15} /> {p.duration} min</span>}
            {p.style && <span>{p.style}</span>}
            {p.targetAreas?.length > 0 && <span>{p.targetAreas.join(' · ')}</span>}
          </div>
          <div className="detail-grid">
            <div><b>How to perform</b>{p.instructions?.map(x => <span key={x}>• {x}</span>)}</div>
            <div><b>Benefits</b>{p.benefits?.map(x => <span key={x}>✓ {x}</span>)}</div>
            <div><b>Precautions</b>{p.precautions?.map(x => <span key={x}>• {x}</span>)}</div>
          </div>
          <div className="safety-note"><ShieldCheck size={17} /><span>Practice within your comfort level. Stop if you feel pain, dizziness, or unusual discomfort.</span></div>
          <button className="btn" onClick={ask}><MessageCircle size={17} /> Ask Yoga Jenny About This Pose</button>
        </div>
      </div>
      {related.length > 0 && <section className="card" style={{ marginTop: 28 }}><div className="card-head"><h2>Related poses</h2></div><div className="recommend-grid">{related.map(x => <Link className="recommend-card" to={`/pose/${x._id}`} key={x._id}><img src={x.imageUrl} alt="" /><div><b>{x.name}</b><small>{x.difficulty} · {x.duration} min</small></div></Link>)}</div></section>}
    </div>
  );
}
