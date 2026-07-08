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
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <PageBackground />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px',
            border: '2px dashed var(--chalk-yellow)',
            color: 'var(--chalk-yellow)',
            borderRadius: '8px', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px'
          }}>
            ⚡
          </div>
          <h1 style={{
            fontFamily: 'Patrick Hand, cursive',
            fontSize: '36px', color: 'var(--chalk-white)'
          }}>
            EduPulse
          </h1>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', marginTop: '6px', fontFamily: 'Patrick Hand' }}>
            AI-Powered Student Performance Analytics
          </p>
        </div>

        {/* Card equivalent - just a subtle background and dashed border */}
        <div className="fade-up" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--chalk-border)', borderRadius: '8px' }}>

          {error && (
            <div style={{
              background: 'transparent',
              borderBottom: '2px dashed var(--chalk-pink)',
              color: 'var(--chalk-pink)', padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '16px', fontFamily: 'Patrick Hand'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{
                  fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '4px',
                  display: 'block', fontFamily: 'Patrick Hand'
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
                  fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '4px',
                  display: 'block', fontFamily: 'Patrick Hand'
                }}>Password</label>
                <input
                  className="input-field"
                  name="password" type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange} required
                />
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <span style={{ color: 'var(--chalk-yellow)', fontSize: '14px', cursor: 'pointer', fontFamily: 'Patrick Hand' }} onClick={() => navigate('/reset-password')}>
                    Forgot Password?
                  </span>
                </div>
              </div>

              <button className="btn-primary" type="submit"
                style={{ width: '100%', padding: '13px', fontSize: '18px', marginTop: '8px' }}
                disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>

            </div>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '24px',
            padding: '16px 0 0',
            borderTop: '1.5px solid var(--chalk-border)',
            fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand'
          }}>
            Don't have an account?{' '}
            <span style={{ color: 'var(--chalk-yellow)', cursor: 'pointer' }}
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