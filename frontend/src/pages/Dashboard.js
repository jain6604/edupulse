import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getCGPA, getSubjectPerformance, getBatchComparison, getCorrelationInsights, getMsritScoreSummary, predictStudent, getBatchSummary } from '../services/api';
import ChatAssistant from '../components/ChatAssistant';
import PageBackground from '../components/PageBackground';
import { AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function Dashboard() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  
  const [analytics, setAnalytics] = useState(null);
  const [cgpa, setCgpa] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [batchComparison, setBatchComparison] = useState(null);
  const [insights, setInsights] = useState([]);
  const [msritSummary, setMsritSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) loadData();
  }, [student]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, cgpaRes, subjectRes, batchRes, insightsRes, msritRes, predRes] = await Promise.all([
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
      setCurrentSemester(subjectRes.data?.semester_number || null);
      setBatchComparison(batchRes.data);
      setInsights(insightsRes.data || []);
      setMsritSummary(msritRes.data);
      setPrediction(predRes.data);
      setBatchSummary(batchRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#03060f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#d4af62', fontFamily: 'Syne, sans-serif' }}>Loading Dashboard...</p>
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
  
  console.log('chartData:', chartData);
  const scoreTrendData = chartData.slice(-6);

  const riskData = [
    { name: 'LOW', value: batchSummary?.risk_distribution?.LOW || 13, color: '#d4af62' },
    { name: 'MEDIUM', value: batchSummary?.risk_distribution?.MEDIUM || 5, color: '#60a5fa' },
    { name: 'HIGH', value: batchSummary?.risk_distribution?.HIGH || 5, color: '#f87171' }
  ];
  const COLORS = ['#d4af62', '#60a5fa', '#f87171'];

  const placementScore = analytics?.placement_score || 0;
  const placementData = [{ name: 'Placement', value: placementScore, fill: '#d4af62' }];

  return (
    <div className="app-container" style={{ background: '#03060f', color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif' }}>
      
      <PageBackground />

      {/* Left Icon Sidebar / Bottom Nav */}
      <div className="app-sidebar">
        <div className="mobile-hide" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', marginBottom: '40px' }}>E</div>
        
        {/* Nav Icons */}
        <div className="app-sidebar-nav">
          <button onClick={() => navigate('/dashboard')} title="Dashboard" style={{ background: 'rgba(212,175,98,0.1)', border: 'none', color: '#d4af62', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
          <button onClick={() => navigate('/input')} title="Data Input" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button onClick={() => navigate('/insights')} title="Insights" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </button>
          <button onClick={() => navigate('/placement')} title="Placement" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </button>
          <button onClick={() => navigate('/skills')} title="Skills" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
          <button onClick={() => navigate('/profile')} title="Profile" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
          <button onClick={() => navigate('/support')} title="Support" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </button>
        </div>
        <div className="mobile-hide" style={{ flex: 1 }} />
        <button className="mobile-hide" onClick={logout} title="Logout" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="app-content">
        
        {/* Top bar */}
        <div className="card dashboard-top-bar" style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '15px' }}>Overview</p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Welcome back, <span className="glow-text">{analytics?.name || student?.name || 'Student'}</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ border: '1px solid #d4af62', color: '#d4af62', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', background: '#d4af62', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
              {riskLevel} RISK
              <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }`}</style>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
              {(student?.name || 'S').charAt(0)}
            </div>
          </div>
        </div>

        {/* 5 stat tiles strip */}
        <div className="grid-5" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ padding: '26px 20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', marginBottom: '10px' }}>GPA</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>{Number(displayCgpa).toFixed(2)}</p>
            <p style={{ fontSize: '13px', color: '#d4af62' }}>{batchComparison?.percentile_rank || batchComparison?.batch_percentile ? `Top ${Math.round(batchComparison.percentile_rank || batchComparison.batch_percentile)}%` : 'N/A'}</p>
          </div>
          <div className="card" style={{ padding: '26px 20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', marginBottom: '10px' }}>Attendance</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>{analytics?.attendance_percentage || 0}%</p>
            <p style={{ fontSize: '13px', color: '#d4af62' }}>Target: 75%</p>
          </div>
          <div className="card" style={{ padding: '26px 20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', marginBottom: '10px' }}>Study Hours</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>{analytics?.avg_study_hours || 0}</p>
            <p style={{ fontSize: '13px', color: '#d4af62' }}>Per week</p>
          </div>
          <div className="card" style={{ padding: '26px 20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', marginBottom: '10px' }}>Placement Score</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>{placementScore}</p>
            <p style={{ fontSize: '13px', color: '#d4af62' }}>Out of 100</p>
          </div>
          <div className="card" style={{ padding: '26px 20px', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '1px', marginBottom: '10px' }}>Batch Rank</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>#{batchComparison?.rank || 'N/A'}</p>
            <p style={{ fontSize: '13px', color: '#d4af62' }}>{batchComparison?.total_students ? `of ${batchComparison.total_students} students` : 'in Batch'}</p>
          </div>
        </div>

        {/* 3-column chart row */}
        <div className="grid-3" style={{ marginBottom: '32px' }}>
          <div className="card">
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>{currentSemester ? `Sem ${currentSemester} Score Trend` : 'Score Trend'}</p>
            <div style={{ height: '200px' }}>
              {scoreTrendData.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  No score data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }} angle={0} height={30} interval={0} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} width={35} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(10,13,26,0.97)',
                        border: '1px solid rgba(212,175,98,0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '12px'
                      }}
                      labelStyle={{ color: '#e9d5a7', fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}
                      itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                      formatter={(value, name) => [`${parseFloat(value).toFixed(1)} / 100`, 'Score']}
                      labelFormatter={(label) => {
                        const full = chartData.find(d => d.shortName === label);
                        return `📚 ${full ? full.fullName : label}`;
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          <div className="card">
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Risk Distribution</p>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <defs>
                    <radialGradient id="lowGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#e9d5a7" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#d4af62" stopOpacity={0.8}/>
                    </radialGradient>
                    <radialGradient id="medGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    </radialGradient>
                    <radialGradient id="highGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fca5a5" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                    </radialGradient>
                  </defs>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="url(#lowGrad)" />
                    <Cell fill="url(#medGrad)" />
                    <Cell fill="url(#highGrad)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,13,26,0.95)',
                      border: '1px solid rgba(212,175,98,0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}
                    formatter={(value, name) => [`${value} students`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '16px', marginTop: '-8px' }}>
                {riskData.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: i === 0 ? '#d4af62' : i === 1 ? '#60a5fa' : '#ef4444',
                      boxShadow: i === 0 ? '0 0 6px #d4af62' : i === 1 ? '0 0 6px #60a5fa' : '0 0 6px #ef4444'
                    }}/>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Placement Readiness</p>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart width={240} height={200} cx="50%" cy="100%" innerRadius="70%" outerRadius="100%" barSize={15} data={placementData} startAngle={180} endAngle={0} margin={{ top: -20, right: 0, bottom: 0, left: 0 }}>
                    <RadialBar minAngle={15} background={{ fill: 'rgba(255,255,255,0.05)' }} clockWise dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '-40px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '42px', fontWeight: '800', color: '#d4af62', margin: 0, lineHeight: 1 }}>{placementScore}</p>
                <span style={{ background: placementScore >= 70 ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', color: placementScore >= 70 ? '#34d399' : '#fbbf24', padding: '5px 20px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', marginTop: '10px', display: 'inline-block', letterSpacing: '1px' }}>
                  {placementScore >= 70 ? 'READY' : 'IN PROGRESS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-column bottom row */}
        <div className="grid-2-asym">
          <div className="card" style={{ minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Subject Performance</p>
            <div style={{ flex: 1, width: '100%' }}>
              {chartData.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  No score data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 90 }}
                    barSize={42}
                  >
                    <defs>
                      <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e9d5a7" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#b8860b" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#93c5fd" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis
                      dataKey="shortName"
                      tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                      angle={0}
                      height={30}
                      interval={0}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(212,175,98,0.08)', radius: 4 }}
                      contentStyle={{
                        background: 'rgba(10,13,26,0.97)',
                        border: '1px solid rgba(212,175,98,0.35)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        padding: '10px 14px'
                      }}
                      labelStyle={{ color: '#e9d5a7', fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}
                      itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                      formatter={(value, name) => [`${parseFloat(value).toFixed(1)} / 100`, 'Score']}
                      labelFormatter={(label) => {
                        const full = chartData.find(d => d.shortName === label);
                        return `📚 ${full ? full.fullName : label}`;
                      }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={index % 2 === 0 ? 'url(#barGold)' : 'url(#barBlue)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {chartData.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                <div style={{ background: 'rgba(212,175,98,0.08)', border: '1px solid rgba(212,175,98,0.18)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  Avg: {(chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length).toFixed(1)}
                </div>
                <div style={{ background: 'rgba(212,175,98,0.08)', border: '1px solid rgba(212,175,98,0.18)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  Best: {chartData.reduce((prev, current) => (prev.score > current.score) ? prev : current).subject} {chartData.reduce((prev, current) => (prev.score > current.score) ? prev : current).score.toFixed(1)}
                </div>
                <div style={{ background: 'rgba(212,175,98,0.08)', border: '1px solid rgba(212,175,98,0.18)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  Needs Work: {chartData.reduce((prev, current) => (prev.score < current.score) ? prev : current).subject} {chartData.reduce((prev, current) => (prev.score < current.score) ? prev : current).score.toFixed(1)}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>AI Insights</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.slice(0, 4).map((insight, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(212,175,98,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af62', flexShrink: 0 }}>
                    ⚡
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', lineHeight: '1.4' }}>{insight.title || insight.insight}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{insight.description || insight.confidence}</p>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>No insights available yet. Please add more data.</p>
              )}
            </div>
          </div>
        </div>

      </div>
      <ChatAssistant />
    </div>
  );
}

export default Dashboard;