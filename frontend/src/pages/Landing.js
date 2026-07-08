import { useNavigate } from 'react-router-dom';
import PageBackground from '../components/PageBackground';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ position: 'relative' }}>
      <PageBackground />

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            border: '1.5px dashed var(--chalk-yellow)',
            color: 'var(--chalk-yellow)',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px'
          }}>⚡</div>
          <h1 style={{
            fontFamily: 'Patrick Hand, cursive',
            fontSize: '24px', fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            <span>EduPulse</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'var(--chalk-dim)', cursor: 'pointer', marginRight: '6px', fontFamily: 'Patrick Hand' }} onClick={() => navigate('/admin-login')}>Admin</span>
          <button className="btn-secondary" style={{ padding: '6px 16px' }}
            onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" style={{ padding: '6px 16px' }}
            onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '100px 40px 80px', textAlign: 'center',
        position: 'relative', zIndex: 10
      }}>

        {/* Badge */}
        <div className="fade-up" style={{
          display: 'flex', width: 'fit-content', margin: '0 auto 32px auto', alignItems: 'center', gap: '8px',
          borderBottom: '2px dashed var(--chalk-yellow)',
          color: 'var(--chalk-yellow)', padding: '6px 16px',
          fontSize: '16px', fontFamily: 'Patrick Hand',
          animationDelay: '2s'
        }}>
          Built for Hostel Students
        </div>

        {/* Heading */}
        <h2 className="fade-up hero-heading" style={{
          fontFamily: 'Patrick Hand, cursive',
          fontSize: '64px',
          lineHeight: 1.1,
          margin: '0 auto 24px auto', color: 'var(--chalk-white)',
          borderBottom: '2px solid rgba(255,255,255,0.2)',
          display: 'block', width: 'fit-content', paddingBottom: '10px',
          animationDelay: '2.12s'
        }}>
          EduPulse<br />
          <span style={{ fontSize: '32px', color: 'var(--chalk-dim)' }}>AI-Powered Student Performance Analytics</span>
        </h2>

        {/* Subtext */}
        <p className="fade-up" style={{
          fontSize: '20px', color: 'var(--chalk-white)',
          maxWidth: '600px', margin: '0 auto 48px',
          lineHeight: 1.5, fontFamily: 'Patrick Hand',
          animationDelay: '2.24s'
        }}>
          Track performance, predict risk with ML, get AI-powered
          recommendations — connected to a live 3-layer data pipeline.
        </p>

        {/* CTA Buttons */}
        <div className="fade-up flex-row-stack" style={{
          justifyContent: 'center', flexWrap: 'wrap',
          animationDelay: '2.36s'
        }}>
          <button className="btn-primary"
            style={{ padding: '12px 32px', fontSize: '20px', borderRadius: '6px' }}
            onClick={() => navigate('/register')}>
            Start for Free →
          </button>
          <button className="btn-secondary"
            style={{ padding: '12px 32px', fontSize: '20px', borderRadius: '6px' }}
            onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>

        {/* Stats Row */}
        <div className="fade-up stats-row-mobile" style={{
          display: 'flex', justifyContent: 'center',
          marginTop: '80px', gap: '0',
          borderTop: '1.5px solid var(--chalk-border)',
          paddingTop: '48px',
          animationDelay: '2.48s'
        }}>
          {[
            { number: 'ETL', label: '3-Layer Pipeline' },
            { number: 'ML', label: 'Risk Prediction' },
            { number: 'AI', label: 'Smart Insights' },
            { number: 'Live', label: 'Power BI Analytics' },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '0 24px',
              borderRight: i < 3 ? '1.5px solid var(--chalk-border)' : 'none'
            }}>
              <p style={{
                fontFamily: 'Caveat, cursive',
                fontSize: '48px', color: 'var(--chalk-yellow)',
                marginBottom: '6px'
              }}>{stat.number}</p>
              <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="content-container" style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 40px 100px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '24px',
        position: 'relative', zIndex: 10
      }}>
        <style>{`
          .landing-card-hover {
            transition: transform 0.3s ease !important;
          }
          .landing-card-hover:hover {
            transform: translateY(-6px) !important;
          }
        `}</style>
        {[
          { icon: '📊', title: 'Performance Analytics', desc: 'Real-time score tracking, GPA trends and attendance insights powered by PostgreSQL.' },
          { icon: '🤖', title: 'ML Risk Prediction', desc: 'Random Forest classifier predicts LOW / MEDIUM / HIGH risk before your exams.' },
          { icon: '🎯', title: 'Placement Readiness', desc: 'Weighted score across academics, skills and achievements tells you exactly where you stand.' },
          { icon: '💡', title: 'Smart Recommendations', desc: 'Data-driven personalized tips generated from your actual academic performance.' },
        ].map((f, i) => (
          <div 
            key={i} 
            className="fade-up landing-card-hover" 
            style={{ 
              flex: '1 1 240px',
              maxWidth: '280px',
              animationDuration: '1.2s',
              animationDelay: `${2.8 + (i * 0.35)}s`,
              borderBottom: '1.5px solid var(--chalk-border)',
              padding: '24px',
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
            <h3 style={{
              fontFamily: 'Patrick Hand, cursive',
              fontSize: '22px', color: 'var(--chalk-white)',
              marginBottom: '8px'
            }}>{f.title}</h3>
            <p style={{ fontSize: '16px', color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand', lineHeight: 1.4 }}>{f.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Landing;