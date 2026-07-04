import PageBackground from '../components/PageBackground';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getAnomalies } from '../services/api';

function Placement() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) loadData();
  }, [student]);

  const loadData = async () => {
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
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#34d399';
    if (score >= 40) return '#fbbf24';
    return '#f87171';
  };

  const skills = [
    { name: 'Python', category: 'Technical', color: '#d4af62' },
    { name: 'SQL', category: 'Technical', color: '#60a5fa' },
    { name: 'Power BI', category: 'Analytics', color: '#e9d5a7' },
    { name: 'Excel', category: 'Analytics', color: '#34d399' },
    { name: 'Statistics', category: 'Analytics', color: '#fbbf24' },
    { name: 'DSA', category: 'Technical', color: '#f87171' },
    { name: 'Communication', category: 'Soft Skills', color: '#60a5fa' },
    { name: 'Problem Solving', category: 'Soft Skills', color: '#d4af62' },
  ];

  if (loading) return (
    <div style={{ position: 'relative', background: '#03060f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid rgba(212,175,98,0.2)',
          borderTop: '3px solid #d4af62',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#475569', fontSize: '14px' }}>Calculating placement readiness...</p>
      </div>
    </div>
  );

  const placementScore = analytics?.placement_score || 0;
  const scoreColor = getScoreColor(placementScore);
  const strongAreas = analytics?.strong_areas?.split(', ').filter(Boolean) || [];
  const weakAreas = analytics?.weak_areas?.split(', ').filter(Boolean) || [];

  return (
    <div className="page-wrapper">
      <div className="aurora-bar" />

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #d4af62, #60a5fa)',
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>⚡</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800' }}>
            <span className="glow-text">EduPulse</span>
          </h1>
        </div>
        <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '13px' }}
          onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </nav>

      <div className="content-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: '800', letterSpacing: '-1px' }}>
            Placement Readiness
          </h2>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            See how ready you are for campus placements.
          </p>
        </div>

        {/* Placement Score Card */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '20px', padding: '40px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Overall Placement Readiness
          </p>

          {/* Score Circle */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: `rgba(${placementScore >= 70 ? '52,211,153' : placementScore >= 40 ? '251,191,36' : '248,113,113'},0.08)`,
            border: `3px solid ${scoreColor}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: `0 0 40px ${scoreColor}30`
          }}>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '36px', fontWeight: '800', color: scoreColor
            }}>{placementScore}</span>
            <span style={{ fontSize: '11px', color: '#475569' }}>/ 100</span>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px', height: '8px',
            maxWidth: '400px', margin: '0 auto 16px', overflow: 'hidden'
          }}>
            <div style={{
              width: `${placementScore}%`, height: '100%',
              background: `linear-gradient(90deg, #d4af62, ${scoreColor})`,
              borderRadius: '10px', transition: 'width 1.5s ease'
            }} />
          </div>

          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {placementScore >= 70 ? 'You are placement ready!' :
             placementScore >= 40 ? 'Keep improving — you are on the right track.' :
             'Focus on weak areas below to improve your score.'}
          </p>
        </div>

        {/* Strong + Weak Areas */}
        <div className="grid-2" style={{ marginBottom: '20px' }}>

          <div className="card">
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#34d399' }}>
              Strong Areas
            </p>
            {strongAreas.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '13px' }}>Add more data to see strong areas.</p>
            ) : strongAreas.map((area, i) => (
              <div key={i} style={{
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.15)',
                color: '#34d399', padding: '8px 14px',
                borderRadius: '8px', marginBottom: '8px',
                fontSize: '13px', fontWeight: '500'
              }}>✓ {area}</div>
            ))}
          </div>

          <div className="card">
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#f87171' }}>
              Weak Areas
            </p>
            {weakAreas.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '13px' }}>No weak areas detected.</p>
            ) : weakAreas.map((area, i) => (
              <div key={i} style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.15)',
                color: '#f87171', padding: '8px 14px',
                borderRadius: '8px', marginBottom: '8px',
                fontSize: '13px', fontWeight: '500'
              }}>✗ {area}</div>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>
            Skills for Data / Software Roles
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px'
          }}>
            {skills.map((skill, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '12px 16px', borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', transition: 'all 0.2s'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600' }}>{skill.name}</p>
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{skill.category}</p>
                </div>
                <span style={{
                  fontSize: '11px', padding: '3px 10px',
                  borderRadius: '6px', fontWeight: '600',
                  background: `${skill.color}15`,
                  color: skill.color,
                  border: `1px solid ${skill.color}30`
                }}>Learn</span>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <div className="card">
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#fbbf24' }}>
              Alerts Detected
            </p>
            {anomalies.map((a, i) => (
              <div key={i} style={{
                background: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.15)',
                padding: '12px 16px', borderRadius: '10px',
                marginBottom: '10px',
                borderLeft: '3px solid #fbbf24'
              }}>
                <p style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '700', marginBottom: '4px', letterSpacing: '0.5px' }}>
                  {a.type} — {a.severity}
                </p>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>{a.message}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Placement;