import PageBackground from '../components/PageBackground';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudent, getAnalytics, getCGPA, getSkills, getAchievements, getSubjectPerformance } from '../services/api';

function Profile() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [cgpa, setCgpa] = useState(null);
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [subjectsData, setSubjectsData] = useState(null);
  useEffect(() => {
    if (student) loadProfile();
  }, [student]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [studentRes, analyticsRes, cgpaRes, skillsRes, achievementsRes, subjectsRes] = await Promise.all([
        getStudent(student.student_id),
        getAnalytics(student.student_id),
        getCGPA(student.student_id),
        getSkills(student.student_id),
        getAchievements(student.student_id),
        getSubjectPerformance(student.student_id),
      ]);
      setProfile(studentRes.data || {});
      setAnalytics(analyticsRes.data || {});
      setCgpa(cgpaRes.data || {});
      setSkills(skillsRes.data || []);
      setAchievements(achievementsRes.data || []);
      setSubjectsData(subjectsRes.data || {});

      try {
        const photoRes = await fetch(`http://localhost:8000/api/students/${student.student_id}/photo`);
        if (photoRes.ok) setPhotoUrl(photoRes.url);
      } catch(e) {}
      
      try {
        const resumeRes = await fetch(`http://localhost:8000/api/students/${student.student_id}/resume`);
        if (resumeRes.ok) setResumeData({ filename: "resume.pdf", url: resumeRes.url });
      } catch(e) {}

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`http://localhost:8000/api/students/${student.student_id}/upload-photo`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setPhotoUrl(`http://localhost:8000/api/students/${student.student_id}/photo?t=${Date.now()}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`http://localhost:8000/api/students/${student.student_id}/upload-resume`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setResumeData({ filename: data.filename || file.name, url: `http://localhost:8000/api/students/${student.student_id}/resume?t=${Date.now()}` });
        setToastMessage('Resume uploaded successfully!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingResume(false);
    }
  };

  const initials = profile?.name ? profile.name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase() : 'EP';
  const placementScore = analytics?.placement_score ?? analytics?.predicted_placement ?? 0;

  if (loading) return (
    <div style={{ position: 'relative', background: '#03060f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(212,175,98,0.2)', borderTop: '3px solid #d4af62', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#475569', fontSize: '14px' }}>Loading profile...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh', background: '#03060f' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, fontWeight: '500', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMessage}
        </div>
      )}
      <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(212,175,98,0.12)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(96,165,250,0.10)', filter: 'blur(90px)' }} />
      <div className="aurora-bar" />

      <nav className="navbar" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4af62, #60a5fa)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '800' }}>E</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', margin: 0, color: '#f1f5f9' }}><span className="glow-text">EduPulse</span></h1>
        </div>
        <button className="btn-secondary" style={{ padding: '10px 18px' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </nav>

      <main className="content-container" style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '1180px', margin: '0 auto' }}>
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '800', color: '#f8fafc', marginBottom: '10px' }}>Profile</h2>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>A centralized view of your academic identity, performance stats, and key achievements.</p>
        </section>

        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(212,175,98,0.5)' }} />
              ) : (
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #e9d5a7, #d4af62)', display: 'grid', placeItems: 'center', fontSize: '32px', fontWeight: '800', color: '#ffffff', fontFamily: 'Syne, sans-serif' }}>{initials}</div>
              )}
              {uploadingPhoto && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', border: '2px solid rgba(212,175,98,0.2)', borderTop: '2px solid #d4af62', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
              )}
              <label style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '32px', height: '32px', borderRadius: '50%', background: '#d4af62', color: '#000', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 2 }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/><path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              </label>
            </div>
            <div style={{ minWidth: '240px' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Student Profile</p>
              <h3 style={{ margin: '8px 0 6px', fontFamily: 'Syne, sans-serif', fontSize: '28px', color: '#f8fafc' }}>{profile?.name || 'Student Name'}</h3>
              <p style={{ margin: 0, color: '#94a3b8' }}>{profile?.email || 'email@example.com'}</p>
            </div>
            <div style={{ display: 'grid', gap: '10px', minWidth: '220px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Branch: <strong style={{ color: '#f8fafc' }}>{profile?.branch || 'N/A'}</strong></span>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>USN: <strong style={{ color: '#f8fafc' }}>{profile?.usn || 'N/A'}</strong></span>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Hostel: <strong style={{ color: '#f8fafc' }}>{profile?.hostel || 'N/A'}</strong></span>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Joined: <strong style={{ color: '#f8fafc' }}>{profile?.year_of_joining || 'N/A'}</strong></span>
            </div>
          </div>
          <div style={{ marginTop: '24px', padding: '18px 22px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>College</p>
            <p style={{ margin: '6px 0 0', fontSize: '15px', color: '#f8fafc' }}>MS Ramaiah Institute of Technology</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '22px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Subjects</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Syne, sans-serif', fontSize: '28px', color: '#f8fafc' }}>{subjectsData?.total_subjects ?? 0}</h4>
          </div>
          <div className="card" style={{ padding: '22px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CGPA</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Syne, sans-serif', fontSize: '28px', color: '#f8fafc' }}>{cgpa?.cgpa ?? 0}</h4>
          </div>
          <div className="card" style={{ padding: '22px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg Score</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Syne, sans-serif', fontSize: '28px', color: '#f8fafc' }}>{analytics?.avg_score ?? 0}%</h4>
          </div>
          <div className="card" style={{ padding: '22px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Placement Score</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Syne, sans-serif', fontSize: '28px', color: '#f8fafc' }}>{placementScore}</h4>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skills Summary</p>
            <p style={{ margin: '14px 0 0', fontSize: '32px', fontFamily: 'Syne, sans-serif', color: '#f8fafc' }}>{skills.length}</p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Achievements Summary</p>
            <p style={{ margin: '14px 0 0', fontSize: '32px', fontFamily: 'Syne, sans-serif', color: '#f8fafc' }}>{achievements.length}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '16px' }}>Resume</h3>
            {resumeData ? (
              <div>
                <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/></svg>
                  {resumeData.filename}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={resumeData.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none', fontSize: '14px' }}>View Resume</a>
                  <label className="btn-secondary" style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', margin: 0 }}>
                    {uploadingResume ? 'Uploading...' : 'Replace'}
                    <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={uploadingResume} />
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '14px' }}>No resume uploaded yet</p>
                <label className="btn-primary" style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', display: 'inline-block' }}>
                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={uploadingResume} />
                </label>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '8px' }}>ATS Resume Checker</h3>
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '14px' }}>Check how well your resume performs against Applicant Tracking Systems used by top companies</p>
            <div style={{ display: 'grid', gap: '12px' }}>
              <a href="https://resumeworded.com" target="_blank" rel="noreferrer" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='rgba(212,175,98,0.5)'} onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '14px', display: 'block' }}>Resume Worded</strong>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>AI-powered score + detailed feedback</span>
                </div>
                <svg width="14" height="14" fill="#94a3b8" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>
              </a>
              <a href="https://www.jobscan.co" target="_blank" rel="noreferrer" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='rgba(212,175,98,0.5)'} onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '14px', display: 'block' }}>Jobscan</strong>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Match resume to job descriptions</span>
                </div>
                <svg width="14" height="14" fill="#94a3b8" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>
              </a>
              <a href="https://www.topresume.com/resume-review" target="_blank" rel="noreferrer" style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor='rgba(212,175,98,0.5)'} onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '14px', display: 'block' }}>TopResume</strong>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>Free expert review</span>
                </div>
                <svg width="14" height="14" fill="#94a3b8" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>
              </a>
            </div>
            <p style={{ margin: '16px 0 0', color: '#d4af62', fontSize: '13px' }}>💡 Tip: Upload your resume above first, then download it to check on these platforms</p>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '16px' }}>Quick Links</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '14px 18px' }} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            <button className="btn-secondary" style={{ width: '100%', padding: '14px 18px' }} onClick={() => navigate('/input')}>Add Data</button>
            <button className="btn-secondary" style={{ width: '100%', padding: '14px 18px' }} onClick={() => navigate('/placement')}>View Placement</button>
            <a href={`http://localhost:8000/api/reports/${student.student_id}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textAlign: 'center', display: 'inline-block', width: '100%', padding: '14px 18px', textDecoration: 'none' }}>Download PDF Report</a>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Profile;
