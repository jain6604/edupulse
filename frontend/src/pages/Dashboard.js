import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getCGPA, getSubjectPerformance, getBatchComparison, getCorrelationInsights, getMsritScoreSummary, predictStudent, getBatchSummary } from '../services/api';
import ChatAssistant from '../components/ChatAssistant';
import PageBackground from '../components/PageBackground';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom label for PieChart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';
  return (
    <text x={x} y={y} fill="var(--chalk-white)" textAnchor={textAnchor} dominantBaseline="central" style={{fontFamily:'Patrick Hand', fontSize:'12px'}}>
      {name} ({value})
    </text>
  );
};

function Dashboard() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  
  const [analytics, setAnalytics] = useState(null);
  const [cgpa, setCgpa] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [batchComparison, setBatchComparison] = useState(null);
  const [insights, setInsights] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    try {
      const [analyticsRes, cgpaRes, subjectRes, batchRes, insightsRes, , predRes, batchSummaryRes] = await Promise.all([
        getAnalytics(student.student_id).catch(() => ({ data: null })),
        getCGPA(student.student_id).catch(() => ({ data: null })),
        getSubjectPerformance(student.student_id).catch(() => ({ data: { subjects: [] } })),
        getBatchComparison(student.student_id).catch(() => ({ data: null })),
        getCorrelationInsights(student.student_id).catch(() => ({ data: [] })),
        getMsritScoreSummary(student.student_id).catch(() => ({ data: null })),
        predictStudent(student.student_id).catch(() => ({ data: null })),
        getBatchSummary().catch(() => ({ data: null }))
      ]);
      setAnalytics(analyticsRes.data);
      setCgpa(cgpaRes.data);
      setSubjectPerformance(subjectRes.data?.subjects || []);
      setBatchComparison(batchRes.data);
      setInsights(insightsRes.data || []);
      setPrediction(predRes.data);
      setBatchSummary(batchSummaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--chalk-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--chalk-white)', fontFamily: 'Patrick Hand, cursive', fontSize:'24px' }}>Wiping the chalkboard...</p>
      </div>
    );
  }

  const displayCgpa = cgpa?.cgpa ?? cgpa?.gpa ?? analytics?.gpa ?? 0;
  const riskLevel = prediction?.predicted_risk || analytics?.risk_level || 'HIGH';
  const truncate = (str) => str.length > 8 ? str.substring(0, 7) + '.' : str;
  const chartData = subjectPerformance.map(s => ({
    subject: s.subject_name ? s.subject_name.substring(0, 8) + (s.subject_name.length > 8 ? '..' : '') : 'Sub',
    score: parseFloat(s.final_total || s.avg_score || s.total_score || 0),
    fullName: s.subject_name || 'Subject',
    shortName: truncate(s.subject_name || 'Subject')
  }));
  const scoreTrendData = chartData.slice(-6);

  const riskData = [
    { name: 'LOW', value: batchSummary?.risk_distribution?.LOW || 13, color: 'var(--chalk-yellow)' },
    { name: 'MEDIUM', value: batchSummary?.risk_distribution?.MEDIUM || 5, color: 'var(--chalk-cyan)' },
    { name: 'HIGH', value: batchSummary?.risk_distribution?.HIGH || 5, color: 'var(--chalk-pink)' }
  ];
  const placementScore = analytics?.placement_score || 0;

  const NavItem = ({ icon, label, path }) => {
    const active = window.location.pathname === path;
    const strokeColor = active ? "var(--chalk-yellow)" : "rgba(255,255,255,0.6)";
    const shadow = active ? "drop-shadow(0 0 6px var(--chalk-yellow))" : "none";
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer' }} onClick={() => navigate(path)}>
        <div style={{ width:'54px', height:'54px', display:'flex', alignItems:'center', justifyContent:'center', filter: shadow }}>
          {icon(strokeColor)}
        </div>
        <div style={{ fontFamily:'Patrick Hand', fontSize:'11px', color: strokeColor, marginTop:'-4px' }}>{label}</div>
      </div>
    );
  };

  return (
    <div className="classroom">
      <PageBackground />
      
      {/* Left Wooden Shelf (ShelfNav) */}
      <div className="shelf-nav" style={{
        background: 'var(--shelf-bg)',
        borderRight: '3px solid #2a1505',
        boxShadow: 'inset -4px 0 12px rgba(0,0,0,0.4)',
        backgroundImage: 'repeating-linear-gradient(92deg, transparent 0px, transparent 8px, rgba(255,255,255,0.015) 8px, rgba(255,255,255,0.015) 9px), repeating-linear-gradient(180deg, transparent 0px, transparent 62px, rgba(0,0,0,0.25) 62px, rgba(0,0,0,0.25) 66px)',
        zIndex: 10
      }}>
        <div style={{ fontFamily:'Patrick Hand', color:'rgba(255,220,160,0.8)', fontSize:'13px', marginBottom:'24px' }} className="shelf-nav-title">EduPulse</div>
        
        <NavItem path="/dashboard" label="Dashboard" icon={(c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke={c} strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>} />
        <div className="shelf-nav-divider" />
        
        <NavItem path="/insights" label="Insights" icon={(c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke={c} strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>} />
        <div className="shelf-nav-divider" />
        
        <NavItem path="/placement" label="Placement" icon={(c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke={c} strokeWidth="1.5"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10"></path><path d="M5 4h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path><path d="M7 10v7a5 5 0 0 0 10 0v-7"></path></svg>} />
        <div className="shelf-nav-divider" />
        
        <NavItem path="/skills" label="Skills" icon={(c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke={c} strokeWidth="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>} />
        <div className="shelf-nav-divider" />
        
        <NavItem path="/achievements" label="Achieve" icon={(c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke={c} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>} />
        <div className="shelf-nav-divider" />
        
        <NavItem path="/profile" label="Profile" icon={(c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke={c} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>} />
        <div className="shelf-nav-divider" />
      </div>

      <div className="chalkboard" style={{ padding: '20px 40px', overflowY: 'auto', zIndex: 10 }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Patrick Hand', color: 'rgba(255,255,255,0.32)', fontSize: '12px' }}>
            MS Ramaiah Institute of Technology · EduPulse
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer' }} onClick={() => navigate('/input')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"><polygon points="12 19 21 10 14 3 5 12 5 19 12 19"></polygon></svg>
              <div style={{ fontFamily:'Patrick Hand', fontSize:'9px', color:'rgba(255,255,255,0.6)', marginTop:'2px' }}>Input</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer' }} onClick={logout}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,160,100,0.75)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="rgba(255,160,100,0.75)" fill="none" />
                <rect x="7" y="7" width="10" height="10" stroke="rgba(255,160,100,0.75)" fill="none" />
                <path d="M12 12 L24 12 L20 8 M24 12 L20 16" stroke="rgba(255,160,100,0.75)" fill="none" />
              </svg>
              <div style={{ fontFamily:'Patrick Hand', fontSize:'9px', color:'rgba(255,160,100,0.75)', marginTop:'2px' }}>Logout</div>
            </div>
          </div>
        </div>

        {/* Sticky Note */}
        <div style={{ position:'absolute', top:'48px', right:'16px', zIndex:10, transform:'rotate(2deg)', background:'#f0e060', width:'180px', padding:'12px', boxShadow:'2px 4px 10px rgba(0,0,0,0.3)' }}>
          <div style={{ position:'absolute', top:'-6px', left:'50%', transform:'translateX(-50%)', width:'40px', height:'12px', background:'rgba(0,0,0,0.1)' }}></div>
          <div style={{ fontFamily:'Patrick Hand', fontSize:'16px', fontWeight:'bold', color:'#333', borderBottom:'1px solid rgba(0,0,0,0.1)', paddingBottom:'4px', marginBottom:'6px' }}>📌 Reminder</div>
          <div style={{ fontFamily:'Patrick Hand', fontSize:'14px', color:'#444', lineHeight:'1.3' }}>Keep attendance above 75%! You're great at {analytics?.attendance_percentage || 0}% ✓</div>
        </div>

        {/* Row 1: Name & Risk Badge */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Patrick Hand', fontSize: '36px', color: 'var(--chalk-white)', borderBottom: '1.5px solid rgba(255,255,255,0.2)', display: 'inline-block', paddingBottom: '4px' }}>
            {analytics?.name || student?.name || 'Student'}
            <span style={{ fontSize: '14px', marginLeft: '16px', padding: '2px 8px', border: `1.5px dashed ${riskLevel==='LOW'?'var(--chalk-green)':riskLevel==='MEDIUM'?'var(--chalk-cyan)':'var(--chalk-pink)'}`, color: riskLevel==='LOW'?'var(--chalk-green)':riskLevel==='MEDIUM'?'var(--chalk-cyan)':'var(--chalk-pink)', verticalAlign: 'middle', borderRadius: '4px' }}>
              {riskLevel} RISK
            </span>
          </h2>
        </div>

        {/* Row 2: Stats */}
        <div style={{ display: 'flex', gap: '40px', padding: '16px 20px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {[
            {label: 'GPA', value: Number(displayCgpa).toFixed(2), subtitle: `Top ${batchComparison?.percentile_rank || 'N/A'}%`, color: 'var(--chalk-yellow)'},
            {label: 'Attendance', value: `${analytics?.attendance_percentage || 0}%`, subtitle: 'Target: 75%', color: 'var(--chalk-white)'},
            {label: 'Study Hours', value: analytics?.avg_study_hours || 0, subtitle: 'Per week', color: 'var(--chalk-white)'},
            {label: 'Placement Score', value: placementScore, subtitle: 'Out of 100', color: 'var(--chalk-cyan)'},
            {label: 'Batch Rank', value: `#${batchComparison?.rank || 'N/A'}`, subtitle: `of ${batchComparison?.total_students || '?'} students`, color: 'var(--chalk-pink)'}
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '42px', fontFamily: 'Caveat', color: stat.color }}>{stat.value}</div>
              <div style={{ fontFamily: 'Patrick Hand', color: 'var(--chalk-dim)', fontSize: '13px', borderBottom: '1.5px solid rgba(255,255,255,0.25)', paddingBottom: '3px' }}>{stat.label}</div>
              <div style={{ fontFamily: 'Patrick Hand', color: 'var(--chalk-dim)', fontSize: '11px', marginTop: '3px' }}>{stat.subtitle}</div>
            </div>
          ))}
        </div>

        {/* Row 3: BarChart, PieChart, Insights */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {/* Subject Performance */}
          <div style={{ flex: '0 0 55%', minWidth: '300px' }}>
            <div style={{ fontFamily: 'Patrick Hand', fontSize: '20px', color: 'var(--chalk-white)', borderBottom: '1.5px solid rgba(255,255,255,0.2)', marginBottom: '16px', display: 'inline-block' }}>Subject Performance</div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="shortName" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Patrick Hand' }} axisLine={{ stroke: 'rgba(255,255,255,0.25)' }} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Patrick Hand' }} axisLine={{ stroke: 'rgba(255,255,255,0.25)' }} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15,36,20,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontFamily: 'Patrick Hand', color: 'white' }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={i % 2 === 0 ? 'rgba(255,245,100,0.75)' : 'rgba(120,255,220,0.7)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Risk Distribution */}
          <div style={{ flex: '0 0 25%', minWidth: '200px' }}>
            <div style={{ fontFamily: 'Patrick Hand', fontSize: '20px', color: 'var(--chalk-white)', borderBottom: '1.5px solid rgba(255,255,255,0.2)', marginBottom: '16px', display: 'inline-block' }}>Risk Distribution</div>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={0} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none" labelLine={true} label={renderCustomizedLabel}>
                    {riskData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15,36,20,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontFamily: 'Patrick Hand', color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Insights */}
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div style={{ fontFamily: 'Patrick Hand', fontSize: '20px', color: 'var(--chalk-white)', borderBottom: '1.5px solid rgba(255,255,255,0.2)', marginBottom: '16px', display: 'inline-block' }}>Key Insights</div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {insights.slice(0, 4).map((insight, idx) => (
                <li key={idx} style={{ marginBottom: '12px', display: 'flex', gap: '8px', fontSize: '14px', fontFamily: 'Patrick Hand', color: 'var(--chalk-white)' }}>
                  <span style={{ color: 'var(--chalk-yellow)' }}>•</span>
                  <span>{insight.title || insight.insight}</span>
                </li>
              ))}
              {insights.length === 0 && <li style={{ fontSize: '14px', fontFamily: 'Patrick Hand', color: 'var(--chalk-dim)' }}>No insights yet.</li>}
            </ul>
          </div>
        </div>

        {/* Row 4: Radial Gauge & AreaChart */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 45%', minWidth: '300px', display:'flex', flexDirection:'column' }}>
            <div style={{ fontFamily: 'Patrick Hand', fontSize: '20px', color: 'var(--chalk-white)', borderBottom: '1.5px solid rgba(255,255,255,0.2)', marginBottom: '24px', display: 'inline-block', alignSelf: 'flex-start' }}>Placement Readiness</div>
            <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg viewBox="0 0 300 170" style={{ width: '100%', maxWidth: '420px', filter: 'drop-shadow(0 0 12px rgba(255,245,100,0.06))' }}>
                <path d="M 25 150 A 125 125 0 0 1 275 150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
                <path d="M 25 150 A 125 125 0 0 1 275 150" fill="none" stroke="var(--chalk-yellow)" strokeWidth="12" strokeLinecap="round" strokeDasharray={Math.PI * 125} strokeDashoffset={(Math.PI * 125) * (1 - (placementScore / 100))} style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                
                <text x="150" y="128" textAnchor="middle" fill="var(--chalk-yellow)" fontFamily="Caveat, cursive" fontSize="56px" fontWeight="bold">{placementScore}</text>
                <text x="150" y="150" textAnchor="middle" fill="var(--chalk-dim)" fontFamily="Patrick Hand, cursive" fontSize="16px">/100</text>
              </svg>
              
              <div style={{ marginTop: '-8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {placementScore >= 70 ? (
                  <span style={{ fontFamily: 'Patrick Hand', fontSize: '18px', color: 'var(--chalk-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✓ PLACEMENT READY
                  </span>
                ) : (
                  <span style={{ fontFamily: 'Patrick Hand', fontSize: '18px', color: 'var(--chalk-pink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    NEEDS IMPROVEMENT
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ fontFamily: 'Patrick Hand', fontSize: '20px', color: 'var(--chalk-white)', borderBottom: '1.5px solid rgba(255,255,255,0.2)', marginBottom: '16px', display: 'inline-block' }}>Score Trend</div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="shortName" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Patrick Hand' }} axisLine={{ stroke: 'rgba(255,255,255,0.25)' }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Patrick Hand' }} axisLine={{ stroke: 'rgba(255,255,255,0.25)' }} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15,36,20,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontFamily: 'Patrick Hand', color: 'white' }} />
                  <Area type="monotone" dataKey="score" stroke="rgba(255,245,100,0.78)" strokeWidth={2.5} fill="rgba(255,245,100,0.08)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* AI Chat Button */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '58px', height: '58px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.08)',
          boxShadow: '0 0 12px rgba(255,255,255,0.15)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
        }} onClick={() => document.getElementById('chat-toggle-btn')?.click()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--chalk-white)" stroke="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <circle cx="8" cy="10" r="1.5" fill="var(--chalk-bg)"></circle>
            <circle cx="12" cy="10" r="1.5" fill="var(--chalk-bg)"></circle>
            <circle cx="16" cy="10" r="1.5" fill="var(--chalk-bg)"></circle>
          </svg>
        </div>
        <div style={{ fontFamily: 'Patrick Hand', color: 'rgba(255,255,255,0.55)', fontSize: '10px', marginTop: '4px' }}>AI Chat</div>
      </div>
      
      <ChatAssistant />
    </div>
  );
}

export default Dashboard;