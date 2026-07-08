import React, { useState, useEffect } from 'react';

const PageBackground = () => {
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 768);

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // SVG transform expects numbers (no units)
  const px = (n) => `${n}`;

  return (
  <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'var(--chalk-bg)', overflow:'hidden' }}>
    {/* Worn/uneven radial gradient patches */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 30%, rgba(35,65,30,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(5,15,7,0.5) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(20,40,15,0.3) 0%, transparent 60%)' }} />

    {/* SVG fractalNoise for chalk dust texture */}
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
      <filter id="chalkNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#chalkNoise)"/>
    </svg>

    {/* Eraser smudge ellipses */}
    <div style={{ position: 'absolute', top: '15%', left: '10%', width: '300px', height: '150px', background: 'rgba(50,90,40,0.15)', borderRadius: '50%', transform: 'rotate(-15deg)', filter: 'blur(30px)' }} />
    <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '400px', height: '200px', background: 'rgba(50,90,40,0.15)', borderRadius: '50%', transform: 'rotate(25deg)', filter: 'blur(40px)' }} />
    
    {/* Ghost text from previous lessons */}
    <div style={{ position: 'absolute', top: '25%', right: '10%', fontFamily: 'Patrick Hand', fontSize: '26px', color: 'rgba(255,255,255,0.18)', transform: 'rotate(3deg)' }}>
      ∫ f(x)dx
    </div>
    <div style={{ position: 'absolute', bottom: '15%', left: '25%', fontFamily: 'Patrick Hand', fontSize: '34px', color: 'rgba(255,255,255,0.18)', transform: 'rotate(-2deg)' }}>
      V = IR
    </div>
    <div style={{ position: 'absolute', top: '60%', right: '35%', fontFamily: 'Patrick Hand', fontSize: '24px', color: 'rgba(255,255,255,0.18)', transform: 'rotate(-5deg)' }}>
      CGPA = Σ(Ci×Gi)/ΣCi
    </div>
    <div style={{ position: 'absolute', top: '10%', left: '38%', fontFamily: 'Patrick Hand', fontSize: '20px', color: 'rgba(255,255,255,0.16)', transform: 'rotate(2deg)' }}>
      y = mx + c
    </div>
    <div style={{ position: 'absolute', top: '80%', right: '20%', fontFamily: 'Patrick Hand', fontSize: '24px', color: 'rgba(255,255,255,0.16)', transform: 'rotate(-8deg)' }}>
      {'<div />'}
    </div>
    <div style={{ position: 'absolute', top: '40%', left: '5%', fontFamily: 'Patrick Hand', fontSize: '20px', color: 'rgba(255,255,255,0.16)', transform: 'rotate(-15deg)' }}>
      SELECT * FROM students;
    </div>

    {/* Chalk-drawn hardware sketches */}
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      
      {/* Laptop top right */}
      <g transform={`translate(${px(vw - 120)}, 80)`} stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none">
        <rect x="0" y="0" width="60" height="40" rx="3" />
        <polygon points="-5,40 65,40 70,45 -10,45" />
      </g>
      
      {/* CPU bottom left */}
      <g transform={`translate(60, ${px(vh - 120)})`} stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none">
        <rect x="0" y="0" width="50" height="50" rx="4" />
        <rect x="10" y="10" width="30" height="30" />
        <path d="M -5,10 L 0,10 M -5,25 L 0,25 M -5,40 L 0,40" />
        <path d="M 55,10 L 50,10 M 55,25 L 50,25 M 55,40 L 50,40" />
        <path d="M 10,-5 L 10,0 M 25,-5 L 25,0 M 40,-5 L 40,0" />
        <path d="M 10,55 L 10,50 M 25,55 L 25,50 M 40,55 L 40,50" />
      </g>

      {/* Gear top left */}
      <g transform="translate(80, 100)" stroke="rgba(255,255,255,0.16)" strokeWidth="2" fill="none">
        <circle cx="25" cy="25" r="20" strokeDasharray="5, 5" />
        <circle cx="25" cy="25" r="12" />
        <circle cx="25" cy="25" r="3" fill="rgba(255,255,255,0.16)" />
      </g>

      {/* Circuit Traces top middle */}
      <g transform={`translate(${px(Math.round(vw * 0.5) - 100)}, 60)`} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none">
        <path d="M0,0 L 20,20 L 50,20 M 20,20 L 20,40 L 0,60" />
        <circle cx="0" cy="0" r="3" />
        <circle cx="50" cy="20" r="3" />
        <circle cx="0" cy="60" r="3" />
      </g>

      {/* WiFi bottom right */}
      <g transform={`translate(${px(vw - 150)}, ${px(vh - 100)})`} stroke="rgba(255,255,255,0.16)" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M 0,30 A 30,30 0 0,1 60,30" />
        <path d="M 10,40 A 20,20 0 0,1 50,40" />
        <path d="M 20,50 A 10,10 0 0,1 40,50" />
        <circle cx="30" cy="60" r="4" fill="rgba(255,255,255,0.16)" stroke="none" />
      </g>

      {/* Resistor middle left */}
      <g transform={`translate(30, ${px(Math.round(vh * 0.5))})`} stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none">
        <path d="M 0,15 L 15,15" />
        <rect x="15" y="5" width="40" height="20" />
        <path d="M 55,15 L 70,15" />
      </g>

      {/* Database Stack (Top Middle-Right) */}
      <g transform={`translate(${px(Math.round(vw * 0.7))}, 150)`} stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none">
        <ellipse cx="25" cy="10" rx="25" ry="8" />
        <path d="M 0,10 L 0,25 A 25,8 0 0,0 50,25 L 50,10" />
        <path d="M 0,25 L 0,40 A 25,8 0 0,0 50,40 L 50,25" />
      </g>

      {/* Cloud Server (Bottom Middle-Left) */}
      <g transform={`translate(${px(Math.round(vw * 0.3))}, ${px(vh - 180)})`} stroke="rgba(255,255,255,0.16)" strokeWidth="2" fill="none">
        <path d="M 20,40 A 15,15 0 0,1 20,10 A 25,25 0 0,1 60,15 A 15,15 0 0,1 65,45 Z" />
        <rect x="25" y="45" width="30" height="25" rx="3" />
        <line x1="30" y1="52" x2="50" y2="52" />
        <line x1="30" y1="62" x2="50" y2="62" />
      </g>

      {/* Mouse (Middle Right) */}
      <g transform={`translate(${px(Math.round(vw * 0.85))}, ${px(Math.round(vh * 0.45))})`} stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" style={{ transform: 'rotate(15deg)' }}>
        <rect x="0" y="0" width="30" height="50" rx="15" />
        <path d="M 0,20 L 30,20" />
        <path d="M 15,0 L 15,20" />
        <circle cx="15" cy="12" r="3" />
        <path d="M 15,50 Q 15,80 30,90" strokeDasharray="4 4" />
      </g>

      {/* Keyboard (Middle Bottom) */}
      <g transform={`translate(${px(Math.round(vw * 0.55))}, ${px(vh - 140)})`} stroke="rgba(255,255,255,0.16)" strokeWidth="2" fill="none" style={{ transform: 'rotate(-8deg)' }}>
        <rect x="0" y="0" width="80" height="30" rx="3" />
        <rect x="5" y="5" width="8" height="6" />
        <rect x="17" y="5" width="8" height="6" />
        <rect x="29" y="5" width="8" height="6" />
        <rect x="41" y="5" width="8" height="6" />
        <rect x="53" y="5" width="8" height="6" />
        <rect x="65" y="5" width="10" height="6" />
        <rect x="5" y="15" width="15" height="6" />
        <rect x="24" y="15" width="32" height="6" />
        <rect x="60" y="15" width="15" height="6" />
      </g>

      {/* Bar Chart (Top Left area) */}
      <g transform={`translate(${px(Math.round(vw * 0.18))}, 180)`} stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" style={{ transform: 'rotate(-5deg)' }}>
        <polyline points="0,0 0,40 50,40" />
        <rect x="5" y="20" width="8" height="20" />
        <rect x="18" y="10" width="8" height="30" />
        <rect x="31" y="25" width="8" height="15" />
        <polyline points="5,15 18,5 31,20 45,5" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
      </g>

      {/* Neural Network Node (Middle Top) */}
      <g transform={`translate(${px(Math.round(vw * 0.45))}, 160)`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" style={{ transform: 'rotate(12deg)' }}>
        <circle cx="10" cy="10" r="5" />
        <circle cx="10" cy="40" r="5" />
        <circle cx="40" cy="25" r="7" />
        <line x1="15" y1="12" x2="33" y2="22" strokeDasharray="3 3" />
        <line x1="15" y1="38" x2="33" y2="28" strokeDasharray="3 3" />
      </g>
    </svg>
  </div>
  );
};

export default PageBackground;
