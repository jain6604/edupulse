import PageBackground from '../components/PageBackground';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';

function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ email: '', usn: '', new_password: '', confirm_password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.new_password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword({ email: form.email, usn: form.usn, new_password: form.new_password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid Email or USN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ position: 'relative', background: '#03060f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <PageBackground />
      
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            ⚡
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800' }}>
            <span className="glow-text">Reset Password</span>
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '6px' }}>Verify your identity to continue</p>
        </div>

        <div className="card fade-up" style={{ padding: '32px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>{error}</div>
          )}
          
          {success && (
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
              Password reset successfully! Redirecting to login...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email</label>
                  <input className="input-field" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' }}>USN</label>
                  <input className="input-field" name="usn" type="text" placeholder="1MS20CS000" value={form.usn} onChange={handleChange} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' }}>New Password</label>
                  <input className="input-field" name="new_password" type="password" placeholder="••••••••" value={form.new_password} onChange={handleChange} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Confirm Password</label>
                  <input className="input-field" name="confirm_password" type="password" placeholder="••••••••" value={form.confirm_password} onChange={handleChange} required />
                </div>

                <button className="btn-primary" type="submit" style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '8px', borderRadius: '10px' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', color: '#475569' }}>
            Remembered your password?{' '}
            <span style={{ color: '#e9d5a7', cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('/login')}>
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
