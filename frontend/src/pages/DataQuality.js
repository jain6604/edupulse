import PageBackground from '../components/PageBackground';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DataQuality() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/data-quality/overview');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    try {
      await fetch('http://localhost:8000/api/analytics/pipeline/run', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningPipeline(false);
    }
  };

  if (loading) return (
    <div style={{ position: 'relative', background: '#03060f', minHeight: '100vh', background: '#03060f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,98,0.2)', borderTop: '3px solid #d4af62', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#475569', fontSize: '14px' }}>Loading data quality metrics...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#03060f', backgroundImage: 'radial-gradient(ellipse 60% 50% at 10% 10%, rgba(212,175,98,0.15) 0%, transparent 60%)', color: '#f1f5f9' }}>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #d4af62, #60a5fa, #d4af62, transparent)', backgroundSize: '300%', animation: 'aurora 4s linear infinite', zIndex: 999 }} />
      <style>{`@keyframes aurora { 0% { background-position: 0%; } 100% { background-position: 300%; } }`}</style>

      {/* Navbar */}
      <nav style={{ background: 'rgba(4,1,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(212,175,98,0.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚡</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', background: 'linear-gradient(135deg, #e9d5a7, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduPulse</h1>
          <span style={{ background: 'rgba(212,175,98,0.15)', border: '1px solid rgba(212,175,98,0.3)', color: '#e9d5a7', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', letterSpacing: '1px' }}>ADMIN PANEL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Admin Dashboard</button>
          <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin-login'); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: '800', letterSpacing: '-1px' }}>Data Quality Dashboard</h2>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>EduPulse ETL Pipeline Monitoring</p>
        </div>

        {/* Pipeline Status Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,98,0.2)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>ETL Pipeline Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: data?.last_pipeline_run?.last_run_status === 'Success' ? '#34d399' : (data?.last_pipeline_run?.last_run_status === 'Not run yet' ? '#94a3b8' : '#f87171'), boxShadow: `0 0 10px ${data?.last_pipeline_run?.last_run_status === 'Success' ? '#34d399' : (data?.last_pipeline_run?.last_run_status === 'Not run yet' ? '#94a3b8' : '#f87171')}` }} />
              <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'Syne, sans-serif' }}>{data?.last_pipeline_run?.last_run_status || 'Unknown'}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Last Run: {data?.last_pipeline_run?.last_run_time ? new Date(data.last_pipeline_run.last_run_time).toLocaleString() : 'N/A'}</p>
          </div>
          <button onClick={handleRunPipeline} disabled={runningPipeline} style={{ background: 'linear-gradient(135deg, #d4af62, #60a5fa)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: runningPipeline ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: runningPipeline ? 0.7 : 1 }}>
            {runningPipeline ? 'Running...' : 'Run Pipeline Now'}
          </button>
        </div>

        {/* Completeness Grid */}
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Table Completeness</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {data?.completeness && Object.entries(data.completeness).map(([table, pct]) => {
            const color = pct >= 90 ? '#34d399' : (pct >= 70 ? '#fbbf24' : '#f87171');
            return (
              <div key={table} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', fontWeight: '600' }}>{table}</p>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `4px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: `0 0 20px ${color}40` }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', color }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Anomalies */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Data Anomalies</h3>
            {data?.anomalies?.length === 0 ? (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
                ✓ No anomalies detected
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.anomalies?.map((anom, i) => (
                  <div key={i} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f87171' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#f87171', fontWeight: '700', fontSize: '14px' }}>{anom.type}</span>
                      <span style={{ background: '#f87171', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>{anom.count}</span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '13px' }}>{anom.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Profile Completeness */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', fontWeight: '600' }}>Student Profile Completeness</p>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: `conic-gradient(#d4af62 ${data?.student_profile_completeness || 0}%, rgba(255,255,255,0.05) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 0 30px rgba(212,175,98,0.2)' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#03060f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#e9d5a7' }}>{data?.student_profile_completeness || 0}%</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '80%' }}>Percentage of students with at least one record in scores, attendance, and study logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataQuality;
