import { useNavigate } from 'react-router-dom';


// Floating particles component
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 8}s`,
    size: Math.random() > 0.5 ? '3px' : '2px',
    color: i % 3 === 0 ? 'rgba(96,165,250,0.6)' : i % 3 === 1 ? 'rgba(212,175,98,0.5)' : 'rgba(212,175,98,0.6)'
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          bottom: '-10px',
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          animation: `floatUp ${p.duration} ${p.delay} linear infinite`
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper" style={{ position: 'relative' }}>
      <Particles />

      {/* Circuit SVG Background */}
      <svg className="circuit-bg" width="100%" height="100%" preserveAspectRatio="none" style={{ opacity: 0.25 }}>
        <path className="circuit-path" d="M0,100 L200,100 L250,50 L500,50 L550,150 L1000,150" />
        <path className="circuit-path" d="M0,300 L150,300 L200,200 L600,200 L650,400 L1000,400" />
        <circle cx="200" cy="100" r="3" className="circuit-dot" />
        <circle cx="250" cy="50" r="3" className="circuit-dot" />
        <circle cx="500" cy="50" r="3" className="circuit-dot" />
        <circle cx="150" cy="300" r="3" className="circuit-dot" />
        <circle cx="200" cy="200" r="3" className="circuit-dot" />
        <circle cx="600" cy="200" r="3" className="circuit-dot" />
        <circle r="4" className="traveling-dot">
          <animateMotion dur="4s" repeatCount="indefinite" path="M0,100 L200,100 L250,50 L500,50 L550,150 L1000,150" />
        </circle>
        <circle r="4" className="traveling-dot">
          <animateMotion dur="5s" repeatCount="indefinite" path="M0,300 L150,300 L200,200 L600,200 L650,400 L1000,400" />
        </circle>
        <text x="10%" y="20%" className="math-symbol">{'return GPA;'}</text>
        <text x="80%" y="15%" className="math-symbol">∫</text>
        <text x="70%" y="80%" className="math-symbol">{'{ }'}</text>
        <text x="20%" y="85%" className="math-symbol">∑ V=IR</text>
        <circle cx="90%" cy="10%" r="300" fill="rgba(212,175,98,0.14)" filter="blur(80px)" />
      </svg>

      {/* Circuit bottom bar */}
      <div className="aurora-bar" />

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #d4af62, #60a5fa)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px'
          }}>⚡</div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '20px', fontWeight: '800',
            letterSpacing: '-0.5px'
          }}>
            <span className="glow-text">EduPulse</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginRight: '6px' }} onClick={() => navigate('/admin-login')}>Admin</span>
          <button className="btn-secondary" style={{ padding: '8px 18px' }}
            onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" style={{ padding: '8px 18px' }}
            onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '100px 40px 80px', textAlign: 'center'
      }}>

        {/* Badge */}
        <div className="fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(212,175,98,0.1)',
          border: '1px solid rgba(212,175,98,0.2)',
          color: '#e9d5a7', padding: '6px 16px',
          borderRadius: '20px', fontSize: '12px',
          fontWeight: '600', marginBottom: '32px',
          letterSpacing: '0.5px',
          animationDelay: '2s'
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#d4af62',
            boxShadow: '0 0 8px #d4af62, 0 0 16px rgba(212,175,98,0.5)',
            display: 'inline-block',
            animation: 'blink 2s ease-in-out infinite'
          }} />
          Built for Hostel Students
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        </div>

        {/* Heading */}
        <h2 className="fade-up hero-heading" style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '55px', fontWeight: '800',
          lineHeight: 1.05, letterSpacing: '-3px',
          marginBottom: '24px', color: 'white',
          animationDelay: '2.12s'
        }}>
          AI-Powered<br />
          <span className="glow-text">Student Performance</span> Analytics
        </h2>

        {/* Subtext */}
        <p className="fade-up" style={{
          fontSize: '17px', color: 'rgba(255,255,255,0.4)',
          maxWidth: '520px', margin: '0 auto 48px',
          lineHeight: 1.75, fontWeight: '400',
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
            style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '10px' }}
            onClick={() => navigate('/register')}>
            Start for Free →
          </button>
          <button className="btn-secondary"
            style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '10px' }}
            onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>

        {/* Stats Row */}
        <div className="fade-up stats-row-mobile" style={{
          display: 'flex', justifyContent: 'center',
          marginTop: '80px', gap: '0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
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
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none'
            }}>
              <p style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '30px', fontWeight: '800',
                background: 'linear-gradient(135deg, #e9d5a7, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '6px'
              }}>{stat.number}</p>
              <p style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="content-container" style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 40px 100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        <style>{`
          .landing-card-hover {
            transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
          }
          .landing-card-hover:hover {
            transform: translateY(-6px) !important;
            border-color: rgba(212,175,98,0.35) !important;
            box-shadow: 0 8px 32px rgba(212,175,98,0.08) !important;
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
            className="fade-up" 
            style={{ 
              animationDuration: '1.2s',
              animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              animationDelay: `${2.8 + (i * 0.35)}s` 
            }}
          >
            <div className="card landing-card-hover" style={{ padding: '28px', height: '100%' }}>
              <div style={{ fontSize: '25px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '15px', fontWeight: '700',
                marginBottom: '8px', letterSpacing: '-0.3px'
              }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Landing;