import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import PageBackground from '../components/PageBackground';

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await adminLogin(form);
      const token = res.data.access_token;
      localStorage.setItem('admin_token', token);
      navigate('/admin');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
      <PageBackground />
      <div style={{ width: '100%', maxWidth: '420px', zIndex: 1, position: 'relative' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '18px', fontFamily: 'Patrick Hand', color: 'var(--chalk-white)', fontSize: '36px' }}>Admin Login</h2>
        <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--chalk-border)', borderRadius: '8px' }}>
          {error && <div style={{ background: 'transparent', borderBottom: '2px dashed var(--chalk-pink)', color: 'var(--chalk-pink)', padding: '12px 16px', marginBottom: '20px', fontSize: '16px', fontFamily: 'Patrick Hand' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input name="email" type="email" placeholder="admin@msrit.edu" value={form.email} onChange={handleChange} required className="input-field" />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input-field" />
              <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            </div>
          </form>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--chalk-dim)', 
              fontSize: '18px', 
              fontFamily: 'Patrick Hand',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed'
            }}
          >
            ← Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
