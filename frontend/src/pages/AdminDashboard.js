import PageBackground from '../components/PageBackground';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    try {
      const res = await fetch('http://localhost:8000/api/students/admin/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin-login');
  };

  if (loading) return (
    <div style={{ position: 'relative', background: '#03060f', minHeight: '100vh', background: '#03060f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        <p style={{ color: '#475569', fontSize: '14px' }}>Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#03060f', backgroundImage: 'radial-gradient(ellipse 60% 50% at 10% 10%, rgba(212,175,98,0.15) 0%, transparent 60%)', color: '#f1f5f9' }}>

      {/* Aurora bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, #d4af62, #60a5fa, #d4af62, transparent)',
        backgroundSize: '300%',
        animation: 'aurora 4s linear infinite',
        zIndex: 999
      }} />
      <style>{`@keyframes aurora { 0% { background-position: 0%; } 100% { background-position: 300%; } }`}</style>

      {/* Navbar */}
      <nav style={{
        background: 'rgba(4,1,15,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,98,0.1)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #d4af62, #60a5fa)',
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>⚡</div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '18px', fontWeight: '800',
            background: 'linear-gradient(135deg, #e9d5a7, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>EduPulse</h1>
          <span style={{
            background: 'rgba(212,175,98,0.15)',
            border: '1px solid rgba(212,175,98,0.3)',
            color: '#e9d5a7', fontSize: '11px',
            fontWeight: '700', padding: '3px 10px',
            borderRadius: '20px', letterSpacing: '1px'
          }}>ADMIN PANEL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#475569', fontSize: '13px' }}>
            MS Ramaiah Institute of Technology
          </span>
          <button onClick={() => navigate('/data-quality')} style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', padding: '7px 16px',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>Data Quality</button>
          <button onClick={logout} style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', padding: '7px 16px',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '26px', fontWeight: '800',
            letterSpacing: '-1px'
          }}>Admin Overview</h2>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            MS Ramaiah Institute of Technology — EduPulse Platform
          </p>
        </div>

        {/* Total Students Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(212,175,98,0.2)',
          borderRadius: '20px', padding: '40px',
          textAlign: 'center', marginBottom: '32px',
          boxShadow: '0 0 40px rgba(212,175,98,0.08)'
        }}>
          <p style={{
            fontSize: '12px', fontWeight: '700',
            color: '#475569', letterSpacing: '2px',
            textTransform: 'uppercase', marginBottom: '16px'
          }}>Total Students Registered</p>
          <p style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '80px', fontWeight: '900',
            background: 'linear-gradient(135deg, #e9d5a7, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1
          }}>{data?.total_students || 0}</p>
          <p style={{ color: '#475569', fontSize: '13px', marginTop: '12px' }}>
            Students actively using EduPulse
          </p>
        </div>

        {/* Students Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700' }}>
              Registered Students
            </p>
            <span style={{
              background: 'rgba(212,175,98,0.1)',
              border: '1px solid rgba(212,175,98,0.2)',
              color: '#e9d5a7', fontSize: '12px',
              fontWeight: '600', padding: '4px 12px',
              borderRadius: '20px'
            }}>{data?.total_students || 0} students</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, rgba(212,175,98,0.15), rgba(96,165,250,0.1))',
                borderBottom: '1px solid rgba(212,175,98,0.2)'
              }}>
                {['USN', 'Branch', 'Year of Joining', 'Date Joined'].map(h => (
                  <th key={h} style={{
                    padding: '14px 20px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '700',
                    color: '#e9d5a7', letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.students?.map((s, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.2s'
                }}>
                  <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                    {s.usn && s.usn !== 'Not provided' ? (
                      <span style={{
                        background: 'rgba(212,175,98,0.1)',
                        border: '1px solid rgba(212,175,98,0.2)',
                        color: '#e9d5a7', padding: '3px 10px',
                        borderRadius: '6px', fontSize: '12px',
                        fontFamily: 'monospace', fontWeight: '600'
                      }}>{s.usn}</span>
                    ) : (
                      <span style={{ color: '#334155', fontSize: '12px' }}>Not provided</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8' }}>{s.branch}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#94a3b8' }}>{s.year_of_joining}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>{s.joined_on}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;