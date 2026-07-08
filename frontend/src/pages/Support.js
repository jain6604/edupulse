import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';

function Support() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      <PageBackground />

      <nav className="navbar" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px',
            border: '1.5px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)',
            borderRadius: '4px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>⚡</div>
          <h1 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', fontWeight: 'bold' }}>
            EduPulse
          </h1>
        </div>
        <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '16px', fontFamily: 'Patrick Hand' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
        <section style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '48px', color: 'var(--chalk-white)', marginBottom: '10px' }}>Support & Feedback</h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', fontFamily: 'Patrick Hand' }}>Have a review, complaint, or just want to say hi? Feel free to reach out through any of the channels below.</p>
        </section>

        <div style={{ display: 'grid', gap: '20px' }}>
          <a href="mailto:sakshamjain0604@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', textDecoration: 'none', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-yellow)', borderRadius: '8px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '4px', border: '1px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)', display: 'grid', placeItems: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Email</p>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)' }}>sakshamjain0604@gmail.com</h3>
            </div>
          </a>

          <a href="https://www.linkedin.com/in/saksham-jain-ab042327b/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', textDecoration: 'none', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-cyan)', borderRadius: '8px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '4px', border: '1px dashed var(--chalk-cyan)', color: 'var(--chalk-cyan)', display: 'grid', placeItems: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>LinkedIn</p>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)' }}>Saksham Jain</h3>
            </div>
          </a>

          <a href="tel:6261083960" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', textDecoration: 'none', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-green)', borderRadius: '8px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '4px', border: '1px dashed var(--chalk-green)', color: 'var(--chalk-green)', display: 'grid', placeItems: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Contact Number</p>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)' }}>+91 6261083960</h3>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}

export default Support;
