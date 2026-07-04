import PageBackground from '../components/PageBackground';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBatchComparison, getCorrelationInsights, getNarrative, getBatchSummary } from '../services/api';

function Insights() {
  const { student } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);
  const [correlations, setCorrelations] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [batchSummary, setBatchSummary] = useState(null);

  useEffect(() => {
    if (student) loadData();
  }, [student]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [compRes, corrRes, narrRes, summRes] = await Promise.all([
        getBatchComparison(student.student_id),
        getCorrelationInsights(student.student_id),
        getNarrative(student.student_id),
        getBatchSummary()
      ]);
      setComparison(compRes.data);
      setCorrelations(corrRes.data);
      setNarrative(narrRes.data.narrative);
      setBatchSummary(summRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        <p style={{ color: '#475569', fontSize: '14px' }}>Loading batch insights...</p>
      </div>
    </div>
  );

  const getImpactColor = (impact) => {
    if (impact === 'High') return '#d4af62';
    if (impact === 'Medium') return '#60a5fa';
    return '#34d399';
  };

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
            Batch Insights
          </h2>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Compare your performance with your batch and uncover hidden data patterns.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px', borderLeft: '4px solid #d4af62' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
            Your Summary
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
            {narrative.split('\n\n').map((para, i) => (
              <span key={i} style={{ display: 'block', marginBottom: i === 0 ? '8px' : '0' }}>{para}</span>
            ))}
          </p>
        </div>

        {/* Batch Comparison */}
        <div className="grid-2-asym" style={{ marginBottom: '24px' }}>
          
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Your Rank
            </p>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'rgba(212,175,98,0.08)',
              border: '3px solid #d4af62',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 0 30px rgba(212,175,98,0.3)'
            }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#e9d5a7' }}>
                Top<br />{Math.round(comparison?.batch_percentile || 0)}%
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px' }}>
              of {batchSummary?.total_students || 0} students
            </p>
          </div>

          <div className="grid-2">
            <div className="card" style={{ padding: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>GPA vs Batch</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>{comparison?.student_gpa?.toFixed(2)}</span>
                <span style={{ color: comparison?.above_avg_gpa ? '#34d399' : '#f87171', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  {comparison?.above_avg_gpa ? '▲' : '▼'} {Math.abs(comparison?.diff_gpa || 0).toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Batch avg: {comparison?.batch_avg_gpa?.toFixed(2)}</p>
            </div>
            
            <div className="card" style={{ padding: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Attendance vs Batch</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>{comparison?.student_attendance?.toFixed(1)}%</span>
                <span style={{ color: comparison?.above_avg_attendance ? '#34d399' : '#f87171', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  {comparison?.above_avg_attendance ? '▲' : '▼'} {Math.abs(comparison?.diff_attendance || 0).toFixed(1)}%
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Batch avg: {comparison?.batch_avg_attendance?.toFixed(1)}%</p>
            </div>

            <div className="card" style={{ padding: '20px', gridColumn: '1 / span 2' }}>
              <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Study Hours vs Batch</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Syne, sans-serif' }}>{comparison?.student_study_hours?.toFixed(1)}h</span>
                <span style={{ color: comparison?.above_avg_study_hours ? '#34d399' : '#f87171', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  {comparison?.above_avg_study_hours ? '▲' : '▼'} {Math.abs(comparison?.diff_study_hours || 0).toFixed(1)}h
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Batch avg: {comparison?.batch_avg_study_hours?.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        {/* Correlations */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Data Patterns</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {correlations.map((corr, i) => {
              const color = getImpactColor(corr.impact_level);
              return (
                <div key={i} className="card" style={{
                  border: corr.impact_level === 'High' ? `1px solid ${color}60` : undefined,
                  boxShadow: corr.impact_level === 'High' ? `0 0 20px ${color}20` : undefined
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#e2e8f0' }}>{corr.title}</p>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '10px',
                      background: `${color}15`, color: color,
                      border: `1px solid ${color}30`
                    }}>
                      {corr.impact_level} Impact
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                    {corr.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Batch Risk Distribution */}
        {batchSummary && batchSummary.risk_distribution && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
              Batch Risk Distribution
            </p>
            <div style={{ width: '100%', height: '24px', display: 'flex', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{
                width: `${(batchSummary.risk_distribution.LOW / batchSummary.total_students) * 100}%`,
                background: '#34d399', transition: 'width 1s'
              }} />
              <div style={{
                width: `${(batchSummary.risk_distribution.MEDIUM / batchSummary.total_students) * 100}%`,
                background: '#fbbf24', transition: 'width 1s'
              }} />
              <div style={{
                width: `${(batchSummary.risk_distribution.HIGH / batchSummary.total_students) * 100}%`,
                background: '#f87171', transition: 'width 1s'
              }} />
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
                <span style={{ color: '#e2e8f0' }}>Low ({batchSummary.risk_distribution.LOW})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
                <span style={{ color: '#e2e8f0' }}>Medium ({batchSummary.risk_distribution.MEDIUM})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
                <span style={{ color: '#e2e8f0' }}>High ({batchSummary.risk_distribution.HIGH})</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Insights;
