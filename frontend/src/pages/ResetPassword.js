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

  const labelStyle = {
    fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '4px',
    display: 'block', fontFamily: 'Patrick Hand'
  };

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <PageBackground />
      
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', border: '2px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)', borderRadius: '8px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            ⚡
          </div>
          <h1 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '36px', color: 'var(--chalk-white)' }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', marginTop: '6px', fontFamily: 'Patrick Hand' }}>Verify your identity to continue</p>
        </div>

        <div className="fade-up" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--chalk-border)', borderRadius: '8px' }}>
          {error && (
            <div style={{ background: 'transparent', borderBottom: '2px dashed var(--chalk-pink)', color: 'var(--chalk-pink)', padding: '12px 16px', marginBottom: '20px', fontSize: '16px', fontFamily: 'Patrick Hand' }}>{error}</div>
          )}
          
          {success && (
            <div style={{ background: 'transparent', borderBottom: '2px dashed var(--chalk-green)', color: 'var(--chalk-green)', padding: '12px 16px', marginBottom: '20px', fontSize: '16px', fontFamily: 'Patrick Hand' }}>
              Password reset successfully! Redirecting to login...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input className="input-field" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <label style={labelStyle}>USN</label>
                  <input className="input-field" name="usn" type="text" placeholder="1MS20CS000" value={form.usn} onChange={handleChange} required />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input className="input-field" name="new_password" type="password" placeholder="••••••••" value={form.new_password} onChange={handleChange} required />
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input className="input-field" name="confirm_password" type="password" placeholder="••••••••" value={form.confirm_password} onChange={handleChange} required />
                </div>

                <button className="btn-primary" type="submit" style={{ width: '100%', padding: '13px', fontSize: '18px', marginTop: '8px' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px 0 0', borderTop: '1.5px solid var(--chalk-border)', fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand' }}>
            Remembered your password?{' '}
            <span style={{ color: 'var(--chalk-yellow)', cursor: 'pointer' }} onClick={() => navigate('/login')}>
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
