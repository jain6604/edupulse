import PageBackground from '../components/PageBackground';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="page-wrapper" style={{ position: 'relative', background: '#03060f', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <PageBackground />

      

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #d4af62, #60a5fa)',
            borderRadius: '12px', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '22px'
          }}>
            ⚡
          </div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '22px', fontWeight: '800'
          }}>
            <span className="glow-text">EduPulse</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '6px' }}>
            AI-Powered Student Performance Analytics
          </p>
        </div>

        {/* Card */}
        <div className="card fade-up" style={{ padding: '32px' }}>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', padding: '12px 16px',
              borderRadius: '8px', marginBottom: '20px',
              fontSize: '13px'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{
                  fontSize: '12px', fontWeight: '600',
                  color: '#64748b', marginBottom: '8px',
                  display: 'block', letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>Email</label>
                <input
                  className="input-field"
                  name="email" type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange} required
                />
              </div>

              <div>
                <label style={{
                  fontSize: '12px', fontWeight: '600',
                  color: '#64748b', marginBottom: '8px',
                  display: 'block', letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>Password</label>
                <input
                  className="input-field"
                  name="password" type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange} required
                />
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <span style={{ color: '#d4af62', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/reset-password')}>
                    Forgot Password?
                  </span>
                </div>
              </div>

              <button className="btn-primary" type="submit"
                style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '8px', borderRadius: '10px' }}
                disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>

            </div>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '24px',
            padding: '16px 0 0',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '13px', color: '#475569'
          }}>
            Don't have an account?{' '}
            <span style={{ color: '#e9d5a7', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => navigate('/register')}>
              Register
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;