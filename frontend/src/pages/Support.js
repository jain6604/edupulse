import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';

function Support() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh', background: '#03060f' }}>
      <PageBackground />
      <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(212,175,98,0.12)', filter: 'blur(80px)' }} />
      <div className="aurora-bar" />

      <nav className="navbar" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '800' }}>E</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', margin: 0, color: '#f1f5f9' }}><span className="glow-text">EduPulse</span></h1>
        </div>
        <button className="btn-secondary" style={{ padding: '10px 18px' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <section style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: '800', color: '#f8fafc', marginBottom: '10px' }}>Support & Feedback</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>Have a review, complaint, or just want to say hi? Feel free to reach out through any of the channels below.</p>
        </section>

        <div style={{ display: 'grid', gap: '20px' }}>
          <a href="mailto:sakshamjain0604@gmail.com" className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', textDecoration: 'none', transition: 'all 0.3s' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(212,175,98,0.1)', color: '#d4af62', display: 'grid', placeItems: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</p>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'Syne, sans-serif', fontSize: '20px', color: '#f8fafc' }}>sakshamjain0604@gmail.com</h3>
            </div>
          </a>

          <a href="https://www.linkedin.com/in/saksham-jain-ab042327b/" target="_blank" rel="noreferrer" className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', textDecoration: 'none', transition: 'all 0.3s' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(96,165,250,0.1)', color: '#60a5fa', display: 'grid', placeItems: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>LinkedIn</p>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'Syne, sans-serif', fontSize: '20px', color: '#f8fafc' }}>Saksham Jain</h3>
            </div>
          </a>

          <a href="tel:6261083960" className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', textDecoration: 'none', transition: 'all 0.3s' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#34d399', display: 'grid', placeItems: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Number</p>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'Syne, sans-serif', fontSize: '20px', color: '#f8fafc' }}>+91 6261083960</h3>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}

export default Support;
