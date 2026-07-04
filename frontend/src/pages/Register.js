import PageBackground from '../components/PageBackground';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

 const [form, setForm] = useState({
    name: '', email: '', password: '',
    branch: '', hostel: '', year_of_joining: '',
    usn: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({
      ...form,
      year_of_joining: parseInt(form.year_of_joining)
    });
    if (result.success) navigate('/login');
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: '600',
    color: '#64748b', marginBottom: '8px',
    display: 'block', letterSpacing: '0.5px',
    textTransform: 'uppercase'
  };

  return (
    <div className="page-wrapper" style={{ position: 'relative', background: '#03060f', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <PageBackground />

      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-100px', right: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />
      <div style={{
        position: 'fixed', bottom: '-100px', left: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(212,175,98,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', borderRadius: '50%'
      }} />

      

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>

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
          <div style={{
            display: 'inline-block',
            background: 'rgba(212,175,98,0.08)',
            border: '1px solid rgba(212,175,98,0.15)',
            color: '#e9d5a7', fontSize: '11px',
            fontWeight: '600', padding: '4px 12px',
            borderRadius: '20px', marginTop: '8px',
            letterSpacing: '0.5px'
          }}>
            MS Ramaiah Institute of Technology
          </div>
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
                <label style={labelStyle}>Full Name</label>
                <input className="input-field" name="name"
                  placeholder="Saksham Jain"
                  value={form.name} onChange={handleChange} required />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input className="input-field" name="email" type="email"
                  placeholder="saksham@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input className="input-field" name="password" type="password"
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Branch</label>
                  <select className="input-field" name="branch"
                    value={form.branch} onChange={handleChange} required>
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science & Engineering</option>
                    <option value="ISE">Information Science & Engineering</option>
                    <option value="ECE">Electronics & Communication Engineering</option>
                    <option value="EEE">Electrical & Electronics Engineering</option>
                    <option value="ETE">Electronics & Telecommunication Engineering</option>
                    <option value="EIE">Electronics & Instrumentation Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CV">Civil Engineering</option>
                    <option value="CH">Chemical Engineering</option>
                    <option value="BT">Biotechnology</option>
                    <option value="AS">Aerospace Engineering</option>
                    <option value="ME_MD">Medical Electronics Engineering</option>
                    <option value="AIML">CSE (AI & Machine Learning)</option>
                    <option value="CSCY">CSE (Cyber Security)</option>
                    <option value="AIDS">Artificial Intelligence & Data Science</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Hostel</label>
                  <input className="input-field" name="hostel"
                    placeholder="Block A / PG"
                    value={form.hostel} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>USN (University Seat Number)</label>
                <input className="input-field" name="usn"
                  placeholder="1MS22CS001"
                  value={form.usn}
                  onChange={handleChange} />
              </div>

              <div>
                <label style={labelStyle}>Year of Joining</label>
                <input className="input-field" name="year_of_joining"
                  type="number" placeholder="2023"
                  value={form.year_of_joining} onChange={handleChange} required />
              </div>

              <button className="btn-primary" type="submit"
                style={{ width: '100%', padding: '13px', fontSize: '14px', marginTop: '8px', borderRadius: '10px' }}
                disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>

            </div>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '24px',
            padding: '16px 0 0',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '13px', color: '#475569'
          }}>
            Already have an account?{' '}
            <span style={{ color: '#e9d5a7', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => navigate('/login')}>
              Sign In
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;