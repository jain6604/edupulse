import PageBackground from '../components/PageBackground';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSkills, addSkill } from '../services/api';

const suggestions = ['Python', 'SQL', 'Power BI', 'Excel', 'DSA', 'Java', 'React', 'Machine Learning', 'Statistics', 'Communication'];
const categories = ['Technical', 'Analytics', 'Soft Skills', 'Domain'];

function Skills() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [proficiency, setProficiency] = useState(6);
  const [category, setCategory] = useState('Technical');
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) loadSkills();
  }, [student]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const response = await getSkills(student.student_id);
      setSkills(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (value) => {
    setSkillName(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setError('Please enter a skill name.');
      return;
    }
    setError('');
    setSaving(true);

    try {
      await addSkill(student.student_id, {
        skill_name: skillName.trim(),
        proficiency,
        category,
      });
      setSkillName('');
      setProficiency(6);
      setCategory('Technical');
      await loadSkills();
    } catch (err) {
      console.error(err);
      setError('Unable to add skill. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const progressStyle = (value) => ({
    height: '10px',
    width: `${Math.min(100, (value / 10) * 100)}%`,
    borderRadius: '999px',
    background: value >= 8 ? '#d4af62' : value >= 5 ? '#60a5fa' : '#fbbf24',
    transition: 'width 0.3s ease',
  });

  return (
    <div className="page-wrapper" style={{ position: 'relative', background: '#03060f', position: 'relative', overflow: 'hidden', minHeight: '100vh', background: '#03060f' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  position: 'absolute', top: '-80px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(212,175,98,0.12)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(96,165,250,0.10)', filter: 'blur(90px)' }} />
      <div style={{ position: 'absolute', top: '40%', left: '60%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(70px)' }} />
      <div className="aurora-bar" />

      <nav className="navbar" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '800' }}>E</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', margin: 0, color: '#f1f5f9' }}><span className="glow-text">EduPulse</span></h1>
        </div>
        <button className="btn-secondary" style={{ padding: '10px 18px' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>

      <main className="content-container" style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '1180px', margin: '0 auto' }}>
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '800', color: '#f8fafc', marginBottom: '10px' }}>Skills & Proficiency</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '680px' }}>Track your strongest competencies and add new capabilities to keep your EduPulse profile ready for predictive analytics.</p>
        </section>

        <section className="grid-2-asym" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ minHeight: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '20px', color: '#f8fafc' }}>Your Skills</h3>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{skills.length} items</span>
            </div>
            {loading ? (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: '240px' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid rgba(212,175,98,0.2)', borderTop: '3px solid #d4af62', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : skills.length === 0 ? (
              <div style={{ color: '#94a3b8', paddingTop: '28px' }}>No skills added yet. Add your first skill to power up your profile.</div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {skills.map((skill, index) => (
                  <div key={index} style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>{skill.skill_name || skill.skillName || 'Unnamed Skill'}</p>
                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>{skill.category || skill.type || 'General'}</p>
                      </div>
                      <span style={{ color: '#c7d2fe', fontSize: '13px' }}>{skill.proficiency || skill.level || 0}/10</span>
                    </div>
                    <div style={{ height: '10px', width: '100%', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                      <div style={progressStyle(skill.proficiency || skill.level || 0)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', color: '#f8fafc', marginBottom: '14px' }}>Add New Skill</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '18px' }}>Populate new strengths and improve your performance profile.</p>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Skill Name</label>
              <input
                className="input-field"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Enter skill name"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }}
              />

              <div>
                <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Proficiency: {proficiency}</label>
                <input type="range" min="1" max="10" value={proficiency} onChange={(e) => setProficiency(Number(e.target.value))} style={{ width: '100%', marginTop: '8px' }} />
              </div>

              <div>
                <label style={{ color: '#cbd5e1', fontSize: '13px' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }}>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              {error && <div style={{ color: '#f87171', fontSize: '13px' }}>{error}</div>}

              <button type="submit" className="btn-primary" style={{ padding: '14px 18px', fontSize: '14px' }} disabled={saving}>
                {saving ? 'Adding skill...' : 'Add Skill'}
              </button>
            </form>

            <div style={{ marginTop: '26px' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>Popular suggestions</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                    style={{ padding: '10px 14px', borderRadius: '999px', border: '1px solid rgba(212,175,98,0.2)', background: 'rgba(212,175,98,0.08)', color: '#f8fafc', cursor: 'pointer' }}
                  >{suggestion}</button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Skills;
