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
    fontSize: '16px', color: 'var(--chalk-dim)', marginBottom: '4px',
    display: 'block', fontFamily: 'Patrick Hand'
  };

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <PageBackground />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>

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
          <div style={{
            display: 'inline-block',
            borderBottom: '1px dashed var(--chalk-yellow)',
            color: 'var(--chalk-yellow)', fontSize: '14px',
            padding: '2px 8px',
            marginTop: '8px',
            fontFamily: 'Patrick Hand'
          }}>
            MS Ramaiah Institute of Technology
          </div>
        </div>

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
                style={{ width: '100%', padding: '13px', fontSize: '18px', marginTop: '8px' }}
                disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>

            </div>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '24px',
            padding: '16px 0 0',
            borderTop: '1.5px solid var(--chalk-border)',
            fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand'
          }}>
            Already have an account?{' '}
            <span style={{ color: 'var(--chalk-yellow)', cursor: 'pointer' }}
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