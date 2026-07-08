import PageBackground from '../components/PageBackground';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudent, getAnalytics, getCGPA, getSkills, getAchievements, getSubjectPerformance } from '../services/api';

function Profile() {
  const { student } = useAuth();
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

  const loadProfile = useCallback(async () => {
    if (!student) return;
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

      // Check if photo exists
      try {
        const photoCheck = await fetch(`http://localhost:8000/api/students/${student.student_id}/photo`, { method: 'HEAD' });
        if (photoCheck.ok) {
          setPhotoUrl(`http://localhost:8000/api/students/${student.student_id}/photo?t=${Date.now()}`);
        } else {
          setPhotoUrl(null);
        }
      } catch (err) {
        setPhotoUrl(null);
      }

      // Check if resume exists
      try {
        const resumeCheck = await fetch(`http://localhost:8000/api/students/${student.student_id}/resume`, { method: 'HEAD' });
        if (resumeCheck.ok) {
          setResumeData({
            filename: 'resume.pdf',
            url: `http://localhost:8000/api/students/${student.student_id}/resume?t=${Date.now()}`
          });
        } else {
          setResumeData(null);
        }
      } catch (err) {
        setResumeData(null);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1,  textAlign: 'center' }}>
        <p style={{ color: 'var(--chalk-white)', fontFamily: 'Patrick Hand, cursive', fontSize:'24px' }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'transparent', borderBottom: '2px dashed var(--chalk-green)', color: 'var(--chalk-green)', padding: '12px 24px', zIndex: 1000, fontFamily: 'Patrick Hand', fontSize: '18px' }}>
          {toastMessage}
        </div>
      )}
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

      <main className="content-container" style={{ position: 'relative', zIndex: 1, padding: '28px 32px 60px', maxWidth: '1180px', margin: '0 auto' }}>
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '36px', color: 'var(--chalk-white)', marginBottom: '10px' }}>Profile</h2>
          <p style={{ color: 'var(--chalk-dim)', fontSize: '18px', fontFamily: 'Patrick Hand' }}>A centralized view of your academic identity, performance stats, and key achievements.</p>
        </section>

        <div style={{ padding: '28px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover', border: '2px dashed var(--chalk-yellow)' }} />
              ) : (
                <div style={{ width: '90px', height: '90px', borderRadius: '8px', border: '2px dashed var(--chalk-yellow)', display: 'grid', placeItems: 'center', fontSize: '32px', color: 'var(--chalk-yellow)', fontFamily: 'Patrick Hand, cursive' }}>{initials}</div>
              )}
              {uploadingPhoto && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center' }}>
                  <p style={{color: 'var(--chalk-white)', fontFamily: 'Patrick Hand'}}>...</p>
                </div>
              )}
              <label style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '32px', height: '32px', borderRadius: '4px', background: 'transparent', border: '1px dashed var(--chalk-yellow)', color: 'var(--chalk-yellow)', display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 2 }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/><path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              </label>
            </div>
            <div style={{ minWidth: '240px' }}>
              <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Student Profile</p>
              <h3 style={{ margin: '8px 0 6px', fontFamily: 'Patrick Hand, cursive', fontSize: '32px', color: 'var(--chalk-white)' }}>{profile?.name || 'Student Name'}</h3>
              <p style={{ margin: 0, color: 'var(--chalk-dim)', fontFamily: 'Patrick Hand' }}>{profile?.email || 'email@example.com'}</p>
            </div>
            <div style={{ display: 'grid', gap: '10px', minWidth: '220px' }}>
              <span style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Branch: <strong style={{ color: 'var(--chalk-white)' }}>{profile?.branch || 'N/A'}</strong></span>
              <span style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>USN: <strong style={{ color: 'var(--chalk-white)' }}>{profile?.usn || 'N/A'}</strong></span>
              <span style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Hostel: <strong style={{ color: 'var(--chalk-white)' }}>{profile?.hostel || 'N/A'}</strong></span>
              <span style={{ color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Joined: <strong style={{ color: 'var(--chalk-white)' }}>{profile?.year_of_joining || 'N/A'}</strong></span>
            </div>
          </div>
          <div style={{ marginTop: '24px', padding: '18px 22px', border: '1.5px dashed var(--chalk-border)', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>College</p>
            <p style={{ margin: '6px 0 0', fontSize: '18px', color: 'var(--chalk-white)', fontFamily: 'Patrick Hand' }}>MS Ramaiah Institute of Technology</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '22px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
            <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Total Subjects</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Caveat, cursive', fontSize: '36px', color: 'var(--chalk-white)' }}>{subjectsData?.total_subjects ?? 0}</h4>
          </div>
          <div style={{ padding: '22px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
            <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>CGPA</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Caveat, cursive', fontSize: '36px', color: 'var(--chalk-white)' }}>{cgpa?.cgpa ?? 0}</h4>
          </div>
          <div style={{ padding: '22px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
            <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Avg Score</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Caveat, cursive', fontSize: '36px', color: 'var(--chalk-white)' }}>{analytics?.avg_score ?? 0}%</h4>
          </div>
          <div style={{ padding: '22px', background: 'rgba(255,255,255,0.02)', borderBottom: '1.5px solid var(--chalk-border)' }}>
            <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Placement Score</p>
            <h4 style={{ margin: '14px 0 0', fontFamily: 'Caveat, cursive', fontSize: '36px', color: 'var(--chalk-white)' }}>{placementScore}</h4>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Skills Summary</p>
            <p style={{ margin: '14px 0 0', fontSize: '48px', fontFamily: 'Caveat, cursive', color: 'var(--chalk-white)' }}>{skills.length}</p>
          </div>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Achievements Summary</p>
            <p style={{ margin: '14px 0 0', fontSize: '48px', fontFamily: 'Caveat, cursive', color: 'var(--chalk-white)' }}>{achievements.length}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '16px' }}>Resume</h3>
            {resumeData ? (
              <div>
                <p style={{ margin: '0 0 16px', color: 'var(--chalk-dim)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Patrick Hand' }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/></svg>
                  {resumeData.filename}
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={resumeData.url} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none', fontSize: '16px' }}>View Resume</a>
                  <label className="btn-secondary" style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '16px', margin: 0 }}>
                    {uploadingResume ? 'Uploading...' : 'Replace'}
                    <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={uploadingResume} />
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 16px', color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>No resume uploaded yet</p>
                <label className="btn-primary" style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '16px', display: 'inline-block' }}>
                  {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleResumeUpload} disabled={uploadingResume} />
                </label>
              </div>
            )}
          </div>

          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '8px' }}>ATS Resume Checker</h3>
            <p style={{ margin: '0 0 16px', color: 'var(--chalk-dim)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>Check how well your resume performs against Applicant Tracking Systems used by top companies</p>
            <div style={{ display: 'grid', gap: '12px' }}>
              <a href="https://resumeworded.com" target="_blank" rel="noreferrer" style={{ padding: '12px 16px', border: '1px dashed var(--chalk-border)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--chalk-white)', fontSize: '16px', display: 'block', fontFamily: 'Patrick Hand' }}>Resume Worded</strong>
                  <span style={{ color: 'var(--chalk-dim)', fontSize: '14px', fontFamily: 'Patrick Hand' }}>AI-powered score + detailed feedback</span>
                </div>
              </a>
              <a href="https://www.jobscan.co" target="_blank" rel="noreferrer" style={{ padding: '12px 16px', border: '1px dashed var(--chalk-border)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--chalk-white)', fontSize: '16px', display: 'block', fontFamily: 'Patrick Hand' }}>Jobscan</strong>
                  <span style={{ color: 'var(--chalk-dim)', fontSize: '14px', fontFamily: 'Patrick Hand' }}>Match resume to job descriptions</span>
                </div>
              </a>
              <a href="https://www.topresume.com/resume-review" target="_blank" rel="noreferrer" style={{ padding: '12px 16px', border: '1px dashed var(--chalk-border)', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--chalk-white)', fontSize: '16px', display: 'block', fontFamily: 'Patrick Hand' }}>TopResume</strong>
                  <span style={{ color: 'var(--chalk-dim)', fontSize: '14px', fontFamily: 'Patrick Hand' }}>Free expert review</span>
                </div>
              </a>
            </div>
            <p style={{ margin: '16px 0 0', color: 'var(--chalk-yellow)', fontSize: '16px', fontFamily: 'Patrick Hand' }}>💡 Tip: Upload your resume above first, then download it to check on these platforms</p>
          </div>
        </div>

        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--chalk-border)', borderRadius: '8px' }}>
          <h3 style={{ fontFamily: 'Patrick Hand, cursive', fontSize: '24px', color: 'var(--chalk-white)', marginBottom: '16px' }}>Quick Links</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '14px 18px', fontSize: '18px' }} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            <button className="btn-secondary" style={{ width: '100%', padding: '14px 18px', fontSize: '18px' }} onClick={() => navigate('/input')}>Add Data</button>
            <button className="btn-secondary" style={{ width: '100%', padding: '14px 18px', fontSize: '18px' }} onClick={() => navigate('/placement')}>View Placement</button>
            <a href={`http://localhost:8000/api/reports/${student.student_id}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textAlign: 'center', display: 'inline-block', width: '100%', padding: '14px 18px', textDecoration: 'none', fontSize: '18px', boxSizing: 'border-box' }}>Download PDF Report</a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
