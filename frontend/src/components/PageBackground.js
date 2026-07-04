import React from 'react';

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

const PageBackground = () => (
  <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#03060f', overflow:'hidden' }}>
    <Particles />
    
    {/* Circuit SVG Background */}
    <svg className="circuit-bg" width="100%" height="100%" preserveAspectRatio="none" style={{ opacity: 0.25, position: 'absolute', inset: 0 }}>
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
  </div>
);

export default PageBackground;
