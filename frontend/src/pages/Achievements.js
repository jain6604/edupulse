import PageBackground from '../components/PageBackground';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAchievements, addAchievement } from '../services/api';

const typeColors = {
  Hackathon: 'var(--chalk-yellow)',
  Certification: 'var(--chalk-cyan)',
  Internship: 'var(--chalk-green)',
  Sports: 'var(--chalk-pink)',
  Other: 'var(--chalk-white)',
};

function Achievements() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({ type: 'Certification', title: '', date: '' });
  const [error, setError] = useState('');

  const loadAchievements = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    try {
      const response = await getAchievements(student.student_id);
      setAchievements(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

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
    <div className="page-wrapper">
      <PageBackground />

      <nav className="navbar" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px',
            border: '1.5px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)',
            borderRadius: '4px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>⚡</div>
          <h1 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold' }}>
            EduPulse
          </h1>
        </div>
        <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '16px', fontFamily: 'Patrick Hand' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '1120px', margin: '0 auto' }}>
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '36px', color: 'var(--chalk-white)', marginBottom: '10px' }}>Achievements</h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', maxWidth: '680px', fontFamily: 'Patrick Hand' }}>Capture milestones, certifications, internships and competitive wins that make your profile shine.</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '24px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '20px' }}>Achievement Timeline</h3>
            {loading ? (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: '260px' }}>
                <p style={{ color: 'var(--chalk-white)', fontFamily: 'Patrick Hand, cursive', fontSize:'24px' }}>Loading...</p>
              </div>
            ) : achievements.length === 0 ? (
              <div style={{ color: 'var(--chalk-dim)', padding: '32px', textAlign: 'center', border: '1px dashed var(--chalk-border)' }}>
                <p style={{ fontSize: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-white)', marginBottom: '10px' }}>No achievements yet.</p>
                <p style={{ color: 'var(--chalk-dim)', marginBottom: '18px', fontFamily: 'Patrick Hand' }}>Add your first milestone to build a stronger academic profile.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '18px' }}>
                {achievements.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '16px', padding: '18px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColors[item.type] || typeColors.Other, marginTop: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand' }}>{item.type || 'Other'}</span>
                        <span style={{ fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand' }}>{item.date || 'Date not set'}</span>
                      </div>
                      <h4 style={{ margin: '10px 0 0', color: 'var(--chalk-white)', fontSize: '20px', fontFamily: 'Patrick Hand' }}>{item.title || 'Untitled Achievement'}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '16px' }}>Add Achievement</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Type</label>
                <select value={formState.type} onChange={handleChange('type')} className="input-field" style={{ width: '100%' }}>
                  {Object.keys(typeColors).map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Title</label>
                <input className="input-field" value={formState.title} onChange={handleChange('title')} placeholder="Achievement title" />
              </div>
              <div>
                <label style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Date</label>
                <input type="date" value={formState.date} onChange={handleChange('date')} className="input-field" style={{ width: '100%' }} />
              </div>
              {error && <p style={{ color: 'var(--chalk-pink)', fontSize: '16px', margin: 0, fontFamily: 'Patrick Hand' }}>{error}</p>}
              <button type="submit" className="btn-primary" style={{ padding: '14px 18px', fontSize: '16px' }} disabled={saving}>
                {saving ? 'Adding achievement...' : 'Add Achievement'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Achievements;
