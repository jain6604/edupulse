import React from 'react';

function PageTransition({ isTransitioning, currentQuote }) {
  if (!isTransitioning) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
      
      {/* Eraser / Duster */}
      <div style={{
        position: 'absolute',
        width: '380px',
        height: '140px',
        background: '#5c3a21', // wood edge
        border: '4px solid #3d2410',
        borderRadius: '12px',
        boxShadow: '-15px 15px 25px rgba(0,0,0,0.6)',
        animation: 'dusterZigZag 2.5s linear forwards',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001
      }}>
        {/* Wood back of the duster where quote is written */}
        <div style={{ 
          width: '94%', height: '88%', 
          background: '#d4a373', 
          borderRadius: '6px', 
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.4)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '12px',
          textAlign: 'center'
        }}>
          <span style={{ 
            fontFamily: 'Caveat, cursive', 
            color: '#3d2410', // burned wood color
            fontSize: '26px', 
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}>
            "{currentQuote}"
          </span>
        </div>
      </div>

      <style>{`
        @keyframes dusterZigZag {
          0%   { top: 0%;   left: 20%; transform: translate(-50%, -50%) rotate(-5deg); opacity: 0; }
          5%   { opacity: 1; }
          25%  { top: 25%;  left: 80%; transform: translate(-50%, -50%) rotate(5deg); }
          50%  { top: 50%;  left: 20%; transform: translate(-50%, -50%) rotate(-5deg); }
          75%  { top: 75%;  left: 80%; transform: translate(-50%, -50%) rotate(5deg); }
          95%  { opacity: 1; }
          100% { top: 110%; left: 50%; transform: translate(-50%, -50%) rotate(0deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default PageTransition;
