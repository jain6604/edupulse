import PageBackground from '../components/PageBackground';
import { useState, useEffect, useCallback } from 'react';
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

  const loadData = useCallback(async () => {
    if (!student) return;
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
  }, [student]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <p style={{ color: 'var(--chalk-white)', fontFamily: 'Patrick Hand, cursive', fontSize:'24px' }}>Reading insights from the chalkboard...</p>
      </div>
    </div>
  );

  const getImpactColor = (impact) => {
    if (impact === 'High') return 'var(--chalk-pink)';
    if (impact === 'Medium') return 'var(--chalk-cyan)';
    return 'var(--chalk-green)';
  };

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
            Batch Insights
          </h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', marginTop: '4px', fontFamily: 'Patrick Hand' }}>
            Compare your performance with your batch and uncover hidden data patterns.
          </p>
        </div>

        {/* Narrative Section */}
        <div style={{ marginBottom: '24px', padding: '24px', borderLeft: '4px solid var(--chalk-yellow)', background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0' }}>
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--chalk-white)' }}>
            Your Summary
          </p>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', lineHeight: '1.6', fontFamily: 'Patrick Hand' }}>
            {narrative.split('\n\n').map((para, i) => (
              <span key={i} style={{ display: 'block', marginBottom: i === 0 ? '8px' : '0' }}>{para}</span>
            ))}
          </p>
        </div>

        {/* Batch Comparison */}
        <div className="grid-2-asym" style={{ marginBottom: '24px' }}>
          
          <div style={{ textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '16px', fontFamily: 'Patrick Hand' }}>
              Your Rank
            </p>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              border: '2px dashed var(--chalk-yellow)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto'
            }}>
              <span style={{ fontSize: '36px', fontFamily: 'Caveat, cursive', color: 'var(--chalk-yellow)' }}>
                Top<br />{Math.round(comparison?.batch_percentile || 0)}%
              </span>
            </div>
            <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginTop: '16px', fontFamily: 'Patrick Hand' }}>
              of {batchSummary?.total_students || 0} students
            </p>
          </div>

          <div className="grid-2">
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
              <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '8px', fontFamily: 'Patrick Hand' }}>GPA vs Batch</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{ fontSize: '36px', fontFamily: 'Caveat, cursive', color: 'var(--chalk-white)' }}>{comparison?.student_gpa?.toFixed(2)}</span>
                <span style={{ color: comparison?.above_avg_gpa ? 'var(--chalk-green)' : 'var(--chalk-pink)', fontSize: '18px', fontFamily: 'Patrick Hand', marginBottom: '6px' }}>
                  {comparison?.above_avg_gpa ? '▲' : '▼'} {Math.abs(comparison?.diff_gpa || 0).toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginTop: '4px', fontFamily: 'Patrick Hand' }}>Batch avg: {comparison?.batch_avg_gpa?.toFixed(2)}</p>
            </div>
            
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
              <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '8px', fontFamily: 'Patrick Hand' }}>Attendance vs Batch</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{ fontSize: '36px', fontFamily: 'Caveat, cursive', color: 'var(--chalk-white)' }}>{comparison?.student_attendance?.toFixed(1)}%</span>
                <span style={{ color: comparison?.above_avg_attendance ? 'var(--chalk-green)' : 'var(--chalk-pink)', fontSize: '18px', fontFamily: 'Patrick Hand', marginBottom: '6px' }}>
                  {comparison?.above_avg_attendance ? '▲' : '▼'} {Math.abs(comparison?.diff_attendance || 0).toFixed(1)}%
                </span>
              </div>
              <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginTop: '4px', fontFamily: 'Patrick Hand' }}>Batch avg: {comparison?.batch_avg_attendance?.toFixed(1)}%</p>
            </div>

            <div style={{ padding: '20px', gridColumn: '1 / span 2', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
              <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '8px', fontFamily: 'Patrick Hand' }}>Study Hours vs Batch</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{ fontSize: '36px', fontFamily: 'Caveat, cursive', color: 'var(--chalk-white)' }}>{comparison?.student_study_hours?.toFixed(1)}h</span>
                <span style={{ color: comparison?.above_avg_study_hours ? 'var(--chalk-green)' : 'var(--chalk-pink)', fontSize: '18px', fontFamily: 'Patrick Hand', marginBottom: '6px' }}>
                  {comparison?.above_avg_study_hours ? '▲' : '▼'} {Math.abs(comparison?.diff_study_hours || 0).toFixed(1)}h
                </span>
              </div>
              <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginTop: '4px', fontFamily: 'Patrick Hand' }}>Batch avg: {comparison?.batch_avg_study_hours?.toFixed(1)}h</p>
            </div>
          </div>
        </div>

        {/* Correlations */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--chalk-white)' }}>Data Patterns</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {correlations.map((corr, i) => {
              const color = getImpactColor(corr.impact_level);
              return (
                <div key={i} style={{
                  border: `1.5px dashed ${color}`,
                  padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <p style={{ fontSize: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-white)' }}>{corr.title}</p>
                    <span style={{
                      fontSize: '14px', fontFamily: 'Patrick Hand',
                      padding: '2px 8px', borderRadius: '4px',
                      color: color, border: `1px dashed ${color}`
                    }}>
                      {corr.impact_level} Impact
                    </span>
                  </div>
                  <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', lineHeight: '1.5', fontFamily: 'Patrick Hand' }}>
                    {corr.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Batch Risk Distribution */}
        {batchSummary && batchSummary.risk_distribution && (
          <div style={{ marginBottom: '24px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--chalk-white)' }}>
              Batch Risk Distribution
            </p>
            <div style={{ width: '100%', height: '24px', display: 'flex', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{
                width: `${(batchSummary.risk_distribution.LOW / batchSummary.total_students) * 100}%`,
                background: 'var(--chalk-green)', transition: 'width 1s'
              }} />
              <div style={{
                width: `${(batchSummary.risk_distribution.MEDIUM / batchSummary.total_students) * 100}%`,
                background: 'var(--chalk-cyan)', transition: 'width 1s'
              }} />
              <div style={{
                width: `${(batchSummary.risk_distribution.HIGH / batchSummary.total_students) * 100}%`,
                background: 'var(--chalk-pink)', transition: 'width 1s'
              }} />
            </div>
            <div style={{ display: 'flex', gap: '24px', fontSize: '16px', fontFamily: 'Patrick Hand' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--chalk-green)' }} />
                <span style={{ color: 'var(--chalk-white)' }}>Low ({batchSummary.risk_distribution.LOW})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--chalk-cyan)' }} />
                <span style={{ color: 'var(--chalk-white)' }}>Medium ({batchSummary.risk_distribution.MEDIUM})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--chalk-pink)' }} />
                <span style={{ color: 'var(--chalk-white)' }}>High ({batchSummary.risk_distribution.HIGH})</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Insights;
