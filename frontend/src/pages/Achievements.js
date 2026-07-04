import PageBackground from '../components/PageBackground';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAchievements, addAchievement } from '../services/api';

const typeColors = {
  Hackathon: '#d4af62',
  Certification: '#60a5fa',
  Internship: '#34d399',
  Sports: '#fbbf24',
  Other: '#f87171',
};

function Achievements() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({ type: 'Certification', title: '', date: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) loadAchievements();
  }, [student]);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const response = await getAchievements(student.student_id);
      setAchievements(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormState({ ...formState, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.date) {
      setError('Title and date are required.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      await addAchievement(student.student_id, {
        type: formState.type,
        title: formState.title.trim(),
        date: formState.date,
      });
      setFormState({ type: 'Certification', title: '', date: '' });
      await loadAchievements();
    } catch (err) {
      console.error(err);
      setError('Unable to add achievement. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ position: 'relative', background: '#03060f', position: 'relative', minHeight: '100vh', background: '#03060f' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  position: 'absolute', top: '-80px', right: '-90px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(96,165,250,0.10)', filter: 'blur(90px)' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(212,175,98,0.12)', filter: 'blur(80px)' }} />
      <div className="aurora-bar" />

      <nav className="navbar" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '800' }}>E</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', margin: 0, color: '#f1f5f9' }}><span className="glow-text">EduPulse</span></h1>
        </div>
        <button className="btn-secondary" style={{ padding: '10px 18px' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '1120px', margin: '0 auto' }}>
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '800', color: '#f8fafc', marginBottom: '10px' }}>Achievements</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '680px' }}>Capture milestones, certifications, internships and competitive wins that make your profile shine.</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '20px' }}>Achievement Timeline</h3>
            {loading ? (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: '260px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid rgba(212,175,98,0.2)', borderTop: '3px solid #d4af62', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : achievements.length === 0 ? (
              <div style={{ color: '#94a3b8', padding: '32px', textAlign: 'center', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '10px' }}>No achievements yet.</p>
                <p style={{ color: '#94a3b8', marginBottom: '18px' }}>Add your first milestone to build a stronger academic profile.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '18px' }}>
                {achievements.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '16px', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', borderRadius: '999px', background: typeColors[item.type] || typeColors.Other, marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.type || 'Other'}</span>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.date || 'Date not set'}</span>
                      </div>
                      <h4 style={{ margin: '10px 0 0', color: '#f8fafc', fontSize: '17px' }}>{item.title || 'Untitled Achievement'}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '16px' }}>Add Achievement</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Type</label>
                <select value={formState.type} onChange={handleChange('type')} className="input-field" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }}>
                  {Object.keys(typeColors).map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Title</label>
                <input className="input-field" value={formState.title} onChange={handleChange('title')} placeholder="Achievement title" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Date</label>
                <input type="date" value={formState.date} onChange={handleChange('date')} className="input-field" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }} />
              </div>
              {error && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{error}</p>}
              <button type="submit" className="btn-primary" style={{ padding: '14px 18px', fontSize: '14px' }} disabled={saving}>
                {saving ? 'Adding achievement...' : 'Add Achievement'}
              </button>
            </form>
          </div>
        </section>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Achievements;
