import PageBackground from '../components/PageBackground';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getAnomalies } from '../services/api';

function Placement() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    try {
      const [analyticsRes, anomalyRes] = await Promise.all([
        getAnalytics(student.student_id),
        getAnomalies(student.student_id)
      ]);
      setAnalytics(analyticsRes.data);
      setAnomalies(anomalyRes.data.anomalies || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [student]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--chalk-green)';
    if (score >= 40) return 'var(--chalk-cyan)';
    return 'var(--chalk-pink)';
  };

  const skills = [
    { name: 'Python', category: 'Technical', color: 'var(--chalk-yellow)' },
    { name: 'SQL', category: 'Technical', color: 'var(--chalk-cyan)' },
    { name: 'Power BI', category: 'Analytics', color: 'var(--chalk-white)' },
    { name: 'Excel', category: 'Analytics', color: 'var(--chalk-green)' },
    { name: 'Statistics', category: 'Analytics', color: 'var(--chalk-yellow)' },
    { name: 'DSA', category: 'Technical', color: 'var(--chalk-pink)' },
    { name: 'Communication', category: 'Soft Skills', color: 'var(--chalk-cyan)' },
    { name: 'Problem Solving', category: 'Soft Skills', color: 'var(--chalk-yellow)' },
  ];

  if (loading) return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <p style={{ color: 'var(--chalk-white)', fontFamily: 'Patrick Hand, cursive', fontSize:'24px' }}>Calculating placement readiness...</p>
      </div>
    </div>
  );

  const placementScore = analytics?.placement_score || 0;
  const scoreColor = getScoreColor(placementScore);
  const strongAreas = analytics?.strong_areas?.split(', ').filter(Boolean) || [];
  const weakAreas = analytics?.weak_areas?.split(', ').filter(Boolean) || [];

  return (
    <div className="page-wrapper">
      <PageBackground />

      {/* Navbar */}
      <nav className="navbar">
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
        <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '16px', fontFamily: 'Patrick Hand' }}
          onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </nav>

      <div className="content-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '36px', color: 'var(--chalk-white)' }}>
            Placement Readiness
          </h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', marginTop: '4px', fontFamily: 'Patrick Hand' }}>
            See how ready you are for campus placements.
          </p>
        </div>

        {/* Placement Score Card */}
        <div style={{ textAlign: 'center', marginBottom: '20px', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: 'var(--chalk-dim)', marginBottom: '20px', fontFamily: 'Patrick Hand' }}>
            Overall Placement Readiness
          </p>

          {/* Score Circle */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            border: `3px dashed ${scoreColor}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{
              fontFamily: 'Caveat, cursive',
              fontSize: '48px', color: scoreColor
            }}>{placementScore}</span>
            <span style={{ fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand' }}>/ 100</span>
          </div>

          <p style={{ fontSize: '18px', color: 'var(--chalk-white)', fontFamily: 'Patrick Hand' }}>
            {placementScore >= 70 ? 'You are placement ready!' :
             placementScore >= 40 ? 'Keep improving — you are on the right track.' :
             'Focus on weak areas below to improve your score.'}
          </p>
        </div>

        {/* Strong + Weak Areas */}
        <div className="grid-2" style={{ marginBottom: '20px' }}>

          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-green)' }}>
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--chalk-green)' }}>
              Strong Areas
            </p>
            {strongAreas.length === 0 ? (
              <p style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Add more data to see strong areas.</p>
            ) : strongAreas.map((area, i) => (
              <div key={i} style={{
                color: 'var(--chalk-green)', padding: '8px 14px',
                borderRadius: '4px', marginBottom: '8px',
                fontSize: '16px', fontFamily: 'Patrick Hand',
                border: '1px dashed var(--chalk-green)'
              }}>✓ {area}</div>
            ))}
          </div>

          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-pink)' }}>
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--chalk-pink)' }}>
              Weak Areas
            </p>
            {weakAreas.length === 0 ? (
              <p style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>No weak areas detected.</p>
            ) : weakAreas.map((area, i) => (
              <div key={i} style={{
                color: 'var(--chalk-pink)', padding: '8px 14px',
                borderRadius: '4px', marginBottom: '8px',
                fontSize: '16px', fontFamily: 'Patrick Hand',
                border: '1px dashed var(--chalk-pink)'
              }}>✗ {area}</div>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div style={{ marginBottom: '20px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--chalk-white)' }}>
            Skills for Data / Software Roles
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            {skills.map((skill, i) => (
              <div key={i} style={{
                border: '1.5px dashed var(--chalk-border)',
                padding: '12px 16px', borderRadius: '4px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontSize: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-white)' }}>{skill.name}</p>
                  <p style={{ fontSize: '14px', color: 'var(--chalk-dim)', marginTop: '2px', fontFamily: 'Patrick Hand' }}>{skill.category}</p>
                </div>
                <span style={{
                  fontSize: '14px', padding: '3px 10px',
                  borderRadius: '4px', fontFamily: 'Patrick Hand',
                  color: skill.color,
                  border: `1px dashed ${skill.color}`
                }}>Learn</span>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--chalk-yellow)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--chalk-yellow)' }}>
              Alerts Detected
            </p>
            {anomalies.map((a, i) => (
              <div key={i} style={{
                border: '1.5px dashed var(--chalk-yellow)',
                padding: '12px 16px', borderRadius: '4px',
                marginBottom: '10px'
              }}>
                <p style={{ fontSize: '16px', color: 'var(--chalk-yellow)', fontFamily: 'Patrick Hand', marginBottom: '4px' }}>
                  {a.type} — {a.severity}
                </p>
                <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', lineHeight: 1.5, fontFamily: 'Patrick Hand' }}>{a.message}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Placement;