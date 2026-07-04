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
        <h2 style={{ textAlign: 'center', marginBottom: '18px' }}>Admin Login</h2>
        <div className="card">
          {error && <div style={{ color: '#f87171', marginBottom: '12px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input name="email" type="email" placeholder="admin@msrit.edu" value={form.email} onChange={handleChange} required className="input-field" />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="input-field" />
              <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
