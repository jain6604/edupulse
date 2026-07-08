import PageBackground from '../components/PageBackground';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (token) => {
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
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchData(token);
  }, [navigate, fetchData]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin-login');
  };

  if (loading) return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <p style={{ color: 'var(--chalk-white)', fontSize: '24px', fontFamily: 'Patrick Hand, cursive' }}>Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <PageBackground />

      {/* Navbar */}
      <nav style={{
        padding: '22px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '30px', height: '30px',
            border: '1.5px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)',
            borderRadius: '4px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>⚡</div>
          <h1 style={{
            fontFamily: 'Patrick Hand, cursive',
            fontSize: '24px', fontWeight: 'bold', color: 'var(--chalk-white)'
          }}>EduPulse</h1>
          <span style={{
            border: '1px dashed var(--chalk-yellow)',
            color: 'var(--chalk-yellow)', fontSize: '14px',
            fontFamily: 'Patrick Hand', padding: '3px 10px',
            borderRadius: '4px', letterSpacing: '1px'
          }}>ADMIN PANEL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>
            MS Ramaiah Institute of Technology
          </span>
          <button onClick={() => navigate('/data-quality')} style={{
            background: 'transparent',
            border: '1.5px dashed var(--chalk-border)',
            color: 'var(--chalk-white)', padding: '7px 16px',
            borderRadius: '4px', cursor: 'pointer',
            fontSize: '16px', fontFamily: 'Patrick Hand'
          }}>Data Quality</button>
          <button onClick={logout} style={{
            background: 'transparent',
            border: '1.5px dashed var(--chalk-pink)',
            color: 'var(--chalk-pink)', padding: '7px 16px',
            borderRadius: '4px', cursor: 'pointer',
            fontSize: '16px', fontFamily: 'Patrick Hand'
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Title */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'Patrick Hand, cursive',
            fontSize: '36px', color: 'var(--chalk-white)'
          }}>Admin Overview</h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', marginTop: '4px', fontFamily: 'Patrick Hand' }}>
            MS Ramaiah Institute of Technology — EduPulse Platform
          </p>
        </div>

        {/* Total Students Card */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1.5px dashed var(--chalk-yellow)',
          borderRadius: '8px', padding: '40px',
          textAlign: 'center', marginBottom: '32px'
        }}>
          <p style={{
            fontSize: '16px', fontFamily: 'Patrick Hand',
            color: 'var(--chalk-dim)', letterSpacing: '2px',
            textTransform: 'uppercase', marginBottom: '16px'
          }}>Total Students Registered</p>
          <p style={{
            fontFamily: 'Caveat, cursive',
            fontSize: '80px', color: 'var(--chalk-white)',
            lineHeight: 1
          }}>{data?.total_students || 0}</p>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', marginTop: '12px', fontFamily: 'Patrick Hand' }}>
            Students actively using EduPulse
          </p>
        </div>

        {/* Students Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1.5px dashed var(--chalk-border)',
          borderRadius: '8px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1.5px dashed var(--chalk-border)',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', margin: 0 }}>
              Registered Students
            </p>
            <span style={{
              border: '1px dashed var(--chalk-yellow)',
              color: 'var(--chalk-yellow)', fontSize: '16px', fontFamily: 'Patrick Hand',
              padding: '4px 12px', borderRadius: '4px'
            }}>{data?.total_students || 0} students</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                borderBottom: '1.5px dashed var(--chalk-border)'
              }}>
                {['USN', 'Branch', 'Year of Joining', 'Date Joined'].map(h => (
                  <th key={h} style={{
                    padding: '14px 20px', textAlign: 'left',
                    fontSize: '16px', fontFamily: 'Patrick Hand',
                    color: 'var(--chalk-yellow)', letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.students?.map((s, i) => (
                <tr key={i} style={{
                  borderBottom: '1px dashed var(--chalk-border)',
                  transition: 'background 0.2s'
                }}>
                  <td style={{ padding: '14px 20px', fontSize: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-white)' }}>
                    {s.usn && s.usn !== 'Not provided' ? (
                      <span style={{
                        border: '1px dashed var(--chalk-yellow)',
                        color: 'var(--chalk-yellow)', padding: '3px 10px',
                        borderRadius: '4px'
                      }}>{s.usn}</span>
                    ) : (
                      <span style={{ color: 'var(--chalk-dim)' }}>Not provided</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-dim)' }}>{s.branch}</td>
                  <td style={{ padding: '14px 20px', fontSize: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-dim)' }}>{s.year_of_joining}</td>
                  <td style={{ padding: '14px 20px', fontSize: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-dim)' }}>{s.joined_on}</td>
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