import React from 'react';

function PageTransition({ isTransitioning, animationIndex, currentQuote }) {
  if (!isTransitioning) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#03060f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#d4af62',
      fontFamily: 'Space Grotesk, sans-serif'
    }}>
      <div style={{ width: '120px', height: '120px', marginBottom: '24px', position: 'relative' }}>
        {animationIndex === 0 && (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <rect x="10" y="35" width="20" height="30" rx="2" fill="none" stroke="#d4af62" strokeWidth="2" />
            <rect x="70" y="35" width="20" height="30" rx="2" fill="none" stroke="#60a5fa" strokeWidth="2" />
            <line x1="30" y1="50" x2="70" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <rect x="30" y="47" width="6" height="6" fill="#d4af62">
              <animate attributeName="x" values="30;64" dur="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.2" dur="0.5s" repeatCount="indefinite" />
            </rect>
          </svg>
        )}
        {animationIndex === 1 && (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <path id="circuit-path" d="M10,50 L40,50 L40,20 L80,20" fill="none" stroke="#60a5fa" strokeWidth="3" strokeDasharray="100" strokeDashoffset="100">
              <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" fill="freeze" />
            </path>
            <circle r="4" fill="#d4af62">
              <animateMotion dur="2s" fill="freeze">
                <mpath href="#circuit-path" />
              </animateMotion>
            </circle>
          </svg>
        )}
        {animationIndex === 2 && (
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="8" fill="#60a5fa" />
            <ellipse cx="50" cy="50" rx="30" ry="15" fill="none" stroke="rgba(212,175,98,0.3)" strokeWidth="2" transform="rotate(45 50 50)" />
            <circle r="4" fill="#d4af62">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1s" repeatCount="indefinite" />
              <animateMotion dur="1s" repeatCount="indefinite" path="M50,35 A30,15 0 1,1 49.9,35" />
            </circle>
          </svg>
        )}
        {animationIndex === 3 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#d4af62', overflow: 'hidden' }}>
            <div style={{ animation: 'fadeCol 0.6s infinite alternate' }}>0<br/>1<br/>1<br/>0<br/>1<br/>0<br/>1</div>
            <div style={{ animation: 'fadeCol 0.4s infinite alternate-reverse' }}>1<br/>0<br/>1<br/>1<br/>0<br/>0<br/>1</div>
            <div style={{ animation: 'fadeCol 0.8s infinite alternate' }}>1<br/>1<br/>0<br/>0<br/>1<br/>1<br/>0</div>
            <div style={{ animation: 'fadeCol 0.5s infinite alternate-reverse' }}>0<br/>1<br/>0<br/>1<br/>0<br/>0<br/>1</div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa', animation: 'scanline 1s linear infinite' }} />
            <style>{`
              @keyframes fadeCol { from { opacity: 0.2; } to { opacity: 1; } }
              @keyframes scanline { from { top: 0%; } to { top: 100%; } }
            `}</style>
          </div>
        )}
      </div>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', maxWidth: '400px', textAlign: 'center', lineHeight: '1.4' }}>
        {currentQuote}
      </p>
    </div>
  );
}

export default PageTransition;
