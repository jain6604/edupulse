import PageBackground from '../components/PageBackground';
import { useState, useEffect, useCallback } from 'react';
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

  const loadSkills = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    try {
      const response = await getSkills(student.student_id);
      setSkills(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

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
    borderRadius: '4px',
    background: value >= 8 ? 'var(--chalk-yellow)' : value >= 5 ? 'var(--chalk-cyan)' : 'var(--chalk-pink)',
    transition: 'width 0.3s ease',
  });

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

      <main className="content-container" style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '1180px', margin: '0 auto' }}>
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '36px', color: 'var(--chalk-white)', marginBottom: '10px' }}>Skills & Proficiency</h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', maxWidth: '680px', fontFamily: 'Patrick Hand' }}>Track your strongest competencies and add new capabilities to keep your EduPulse profile ready for predictive analytics.</p>
        </section>

        <section className="grid-2-asym" style={{ marginBottom: '32px' }}>
          <div style={{ minHeight: '420px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)' }}>Your Skills</h3>
              <span style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>{skills.length} items</span>
            </div>
            {loading ? (
              <div style={{ display: 'grid', placeItems: 'center', minHeight: '240px' }}>
                <p style={{ color: 'var(--chalk-white)', fontFamily: 'Patrick Hand, cursive', fontSize:'24px' }}>Loading...</p>
              </div>
            ) : skills.length === 0 ? (
              <div style={{ color: 'var(--chalk-dim)', paddingTop: '28px', fontFamily: 'Patrick Hand', fontSize: '18px' }}>No skills added yet. Add your first skill to power up your profile.</div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {skills.map((skill, index) => (
                  <div key={index} style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '20px', fontFamily: 'Patrick Hand', color: 'var(--chalk-white)' }}>{skill.skill_name || skill.skillName || 'Unnamed Skill'}</p>
                        <p style={{ margin: '4px 0 0', color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>{skill.category || skill.type || 'General'}</p>
                      </div>
                      <span style={{ color: 'var(--chalk-white)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>{skill.proficiency || skill.level || 0}/10</span>
                    </div>
                    <div style={{ height: '10px', width: '100%', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={progressStyle(skill.proficiency || skill.level || 0)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '14px' }}>Add New Skill</h3>
            <p style={{ color: 'var(--chalk-dim)', fontSize: '16px', marginBottom: '18px', fontFamily: 'Patrick Hand' }}>Populate new strengths and improve your performance profile.</p>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <label style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Skill Name</label>
              <input
                className="input-field"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Enter skill name"
              />

              <div>
                <label style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Proficiency: {proficiency}</label>
                <input type="range" min="1" max="10" value={proficiency} onChange={(e) => setProficiency(Number(e.target.value))} style={{ width: '100%', marginTop: '8px' }} />
              </div>

              <div>
                <label style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" style={{ width: '100%' }}>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              {error && <div style={{ color: 'var(--chalk-pink)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>{error}</div>}

              <button type="submit" className="btn-primary" style={{ padding: '14px 18px', fontSize: '16px' }} disabled={saving}>
                {saving ? 'Adding skill...' : 'Add Skill'}
              </button>
            </form>

            <div style={{ marginTop: '26px' }}>
              <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', marginBottom: '12px', fontFamily: 'Patrick Hand' }}>Popular suggestions</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                    style={{ padding: '6px 12px', border: '1px dashed var(--chalk-yellow)', background: 'transparent', color: 'var(--chalk-yellow)', cursor: 'pointer', fontFamily: 'Patrick Hand', fontSize: '14px' }}
                  >{suggestion}</button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Skills;
