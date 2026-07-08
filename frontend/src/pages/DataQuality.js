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
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <p style={{ color: 'var(--chalk-white)', fontSize: '24px', fontFamily: 'Patrick Hand' }}>Loading data quality metrics...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <PageBackground />

      {/* Navbar */}
      <nav style={{ padding: '22px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', border: '1.5px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚡</div>
          <h1 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold', color: 'var(--chalk-white)' }}>EduPulse</h1>
          <span style={{ border: '1px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)', fontSize: '14px', fontFamily: 'Patrick Hand', padding: '3px 10px', borderRadius: '4px', letterSpacing: '1px' }}>ADMIN PANEL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: '1.5px dashed var(--chalk-border)', color: 'var(--chalk-white)', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Admin Dashboard</button>
          <button onClick={() => { localStorage.removeItem('admin_token'); navigate('/admin-login'); }} style={{ background: 'transparent', border: '1.5px dashed var(--chalk-pink)', color: 'var(--chalk-pink)', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '36px', color: 'var(--chalk-white)' }}>Data Quality Dashboard</h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', marginTop: '4px', fontFamily: 'Patrick Hand' }}>EduPulse ETL Pipeline Monitoring</p>
        </div>

        {/* Pipeline Status Card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontFamily: 'Patrick Hand' }}>ETL Pipeline Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px', fontFamily: 'Patrick Hand, cursive', color: data?.last_pipeline_run?.last_run_status === 'Success' ? 'var(--chalk-green)' : (data?.last_pipeline_run?.last_run_status === 'Not run yet' ? 'var(--chalk-dim)' : 'var(--chalk-pink)') }}>{data?.last_pipeline_run?.last_run_status || 'Unknown'}</span>
            </div>
            <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', marginTop: '4px', fontFamily: 'Patrick Hand' }}>Last Run: {data?.last_pipeline_run?.last_run_time ? new Date(data.last_pipeline_run.last_run_time).toLocaleString() : 'N/A'}</p>
          </div>
          <button onClick={handleRunPipeline} disabled={runningPipeline} className="btn-primary" style={{ padding: '12px 24px', fontSize: '18px', opacity: runningPipeline ? 0.7 : 1 }}>
            {runningPipeline ? 'Running...' : 'Run Pipeline Now'}
          </button>
        </div>

        {/* Completeness Grid */}
        <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '20px' }}>Table Completeness</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {data?.completeness && Object.entries(data.completeness).map(([table, pct]) => {
            const isGood = pct >= 90;
            const isWarn = pct >= 70 && pct < 90;
            const color = isGood ? 'var(--chalk-green)' : (isWarn ? 'var(--chalk-yellow)' : 'var(--chalk-pink)');
            return (
              <div key={table} style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '18px', color: 'var(--chalk-dim)', marginBottom: '16px', fontFamily: 'Patrick Hand' }}>{table}</p>
                <div style={{ width: '80px', height: '80px', borderRadius: '4px', border: `2px dashed ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <span style={{ fontSize: '32px', fontFamily: 'Caveat, cursive', color }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Anomalies */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px', padding: '24px' }}>
            <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '16px' }}>Data Anomalies</h3>
            {data?.anomalies?.length === 0 ? (
              <div style={{ border: '1.5px dashed var(--chalk-green)', color: 'var(--chalk-green)', padding: '16px', borderRadius: '4px', fontSize: '18px', fontFamily: 'Patrick Hand' }}>
                ✓ No anomalies detected
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.anomalies?.map((anom, i) => (
                  <div key={i} style={{ border: '1.5px dashed var(--chalk-pink)', padding: '16px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--chalk-pink)', fontFamily: 'Patrick Hand', fontSize: '18px' }}>{anom.type}</span>
                      <span style={{ border: '1px dashed var(--chalk-pink)', color: 'var(--chalk-pink)', padding: '2px 8px', borderRadius: '4px', fontSize: '16px', fontFamily: 'Patrick Hand' }}>{anom.count}</span>
                    </div>
                    <p style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand', margin: 0 }}>{anom.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Profile Completeness */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', color: 'var(--chalk-dim)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', fontFamily: 'Patrick Hand' }}>Student Profile Completeness</p>
            <div style={{ width: '120px', height: '120px', borderRadius: '4px', border: '2px dashed var(--chalk-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '48px', fontFamily: 'Caveat, cursive', color: 'var(--chalk-yellow)' }}>{data?.student_profile_completeness || 0}%</span>
            </div>
            <p style={{ fontSize: '18px', color: 'var(--chalk-dim)', maxWidth: '80%', fontFamily: 'Patrick Hand' }}>Percentage of students with at least one record in scores, attendance, and study logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataQuality;
