import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitScores, submitAttendance, runPipeline, getSubjectsByBranch, getSemesters, submitStudyLog, submitMsritScores } from '../services/api';
import PageBackground from '../components/PageBackground';

function InputPortal() {
  const { student } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('scores');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [scoreForm, setScoreForm] = useState({
    subject_id: '', semester_id: '',
    assignment_score: '', midterm_score: '', final_score: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    subject_id: '', semester_id: '',
    classes_attended: '', total_classes: ''
  });

  const [studyForm, setStudyForm] = useState({
    log_date: new Date().toISOString().split('T')[0],
    hours_studied: '', sleep_hours: ''
  });

  const [msritForm, setMsritForm] = useState({
    subject_id: '', semester_id: '',
    cie1_score: '', cie2_score: '',
    component1_score: '', component2_score: '',
  });

  const [msritPreview, setMsritPreview] = useState(null);

  useEffect(() => {
    loadSubjectsAndSemesters();
  }, [student]);

  const loadSubjectsAndSemesters = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('student'));
      const branch = studentData?.branch || 'CSE';
      const [subRes, semRes] = await Promise.all([
        getSubjectsByBranch(branch),
        getSemesters()
      ]);
      setSubjects(subRes.data);
      setSemesters(semRes.data);
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const showMessage = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitScores(student.student_id, {
        subject_id: scoreForm.subject_id,
        semester_id: scoreForm.semester_id,
        assignment_score: parseFloat(scoreForm.assignment_score),
        midterm_score: parseFloat(scoreForm.midterm_score),
        final_score: parseFloat(scoreForm.final_score)
      });
      await runPipeline();
      showMessage('Scores saved and analytics updated!');
      setScoreForm({ subject_id: '', semester_id: '', assignment_score: '', midterm_score: '', final_score: '' });
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to save scores', true);
    } finally { setLoading(false); }
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitAttendance(student.student_id, {
        subject_id: attendanceForm.subject_id,
        semester_id: attendanceForm.semester_id,
        classes_attended: parseInt(attendanceForm.classes_attended),
        total_classes: parseInt(attendanceForm.total_classes)
      });
      await runPipeline();
      showMessage('Attendance saved and analytics updated!');
      setAttendanceForm({ subject_id: '', semester_id: '', classes_attended: '', total_classes: '' });
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to save attendance', true);
    } finally { setLoading(false); }
  };

  const handleStudySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitStudyLog(student.student_id, {
        log_date: studyForm.log_date,
        hours_studied: parseFloat(studyForm.hours_studied),
        sleep_hours: parseFloat(studyForm.sleep_hours)
      });
      await runPipeline();
      showMessage('Study log saved!');
      setStudyForm({
        log_date: new Date().toISOString().split('T')[0],
        hours_studied: '', sleep_hours: ''
      });
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to save study log', true);
    } finally { setLoading(false); }
  };

  const handleMsritSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitMsritScores(student.student_id, {
        subject_id: msritForm.subject_id,
        semester_id: msritForm.semester_id,
        cie1_score: parseFloat(msritForm.cie1_score),
        cie2_score: parseFloat(msritForm.cie2_score),
        component1_score: parseFloat(msritForm.component1_score),
        component2_score: parseFloat(msritForm.component2_score),
        see_score: null
      });
      await runPipeline();
      showMessage('MSRIT marks saved and analytics updated!');
      setMsritForm({
        subject_id: '', semester_id: '',
        cie1_score: '', cie2_score: '',
        component1_score: '', component2_score: '',
      });
      setMsritPreview(null);
    } catch (err) {
      showMessage(err.response?.data?.detail || 'Failed to save MSRIT marks', true);
    } finally { setLoading(false); }
  };

  const calculateMsritPreview = () => {
    if (!msritForm.cie1_score || !msritForm.cie2_score || !msritForm.component1_score || !msritForm.component2_score) {
      return null;
    }
    const cie1 = parseFloat(msritForm.cie1_score);
    const cie2 = parseFloat(msritForm.cie2_score);
    const comp1 = parseFloat(msritForm.component1_score);
    const comp2 = parseFloat(msritForm.component2_score);
    const avgCie = (cie1 + cie2) / 2;
    const internalTotal = avgCie + comp1 + comp2;
    return {
      avg_cie: avgCie.toFixed(2),
      internal_total: internalTotal.toFixed(2)
    };
  };

  useEffect(() => {
    setMsritPreview(calculateMsritPreview());
  }, [msritForm]);

  const labelStyle = {
    fontSize: '12px', fontWeight: '600', color: '#64748b',
    marginBottom: '8px', display: 'block',
    letterSpacing: '0.5px', textTransform: 'uppercase'
  };

  const tabs = ['scores', 'attendance', 'study', 'msrit'];

  return (
    <div className="page-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="aurora-bar" />

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #d4af62, #60a5fa)',
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '14px'
          }}>⚡</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800' }}>
            <span className="glow-text">EduPulse</span>
          </h1>
        </div>
        <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '13px' }}
          onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </nav>

      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: '800', letterSpacing: '-1px' }}>
            Input Portal
          </h2>
          <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
            Enter your academic data — analytics update automatically.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '4px', borderRadius: '10px', marginBottom: '24px'
        }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
              background: activeTab === tab ? 'linear-gradient(135deg, #d4af62, #60a5fa)' : 'transparent',
              color: activeTab === tab ? 'white' : '#475569',
              fontWeight: '600', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', transition: 'all 0.2s',
              textTransform: 'capitalize'
            }}>
              {tab === 'scores' ? 'Scores' : tab === 'attendance' ? 'Attendance' : tab === 'study' ? 'Study Log' : 'MSRIT Marks'}
            </button>
          ))}
        </div>

        {/* Messages */}
        {message && (
          <div style={{
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
            color: '#34d399', padding: '12px 16px', borderRadius: '8px',
            marginBottom: '20px', fontSize: '13px'
          }}>{message}</div>
        )}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', padding: '12px 16px', borderRadius: '8px',
            marginBottom: '20px', fontSize: '13px'
          }}>{error}</div>
        )}

        {/* Scores Form */}
        {activeTab === 'scores' && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: '700', marginBottom: '24px' }}>
              Submit Scores
            </h3>
            <form onSubmit={handleScoreSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <label style={labelStyle}>Subject</label>
                  <select className="input-field"
                    value={scoreForm.subject_id}
                    onChange={e => setScoreForm({ ...scoreForm, subject_id: e.target.value })}
                    required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name} ({s.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Semester</label>
                  <select className="input-field"
                    value={scoreForm.semester_id}
                    onChange={e => setScoreForm({ ...scoreForm, semester_id: e.target.value })}
                    required>
                    <option value="">Select Semester</option>
                    {semesters.map(s => (
                      <option key={s.semester_id} value={s.semester_id}>
                        Semester {s.semester_no} — {s.academic_year} ({s.term})
                      </option>
                    ))}
                  </select>
                </div>

                {[
                  { label: 'Assignment Score (0-100)', name: 'assignment_score' },
                  { label: 'Midterm Score (0-100)', name: 'midterm_score' },
                  { label: 'Final Exam Score (0-100)', name: 'final_score' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={labelStyle}>{field.label}</label>
                    <input className="input-field" type="number"
                      name={field.name} min="0" max="100" placeholder="0 - 100"
                      value={scoreForm[field.name]}
                      onChange={e => setScoreForm({ ...scoreForm, [e.target.name]: e.target.value })}
                      required />
                  </div>
                ))}

                <button className="btn-primary" type="submit"
                  style={{ width: '100%', padding: '13px', marginTop: '8px', borderRadius: '10px' }}
                  disabled={loading}>
                  {loading ? 'Saving...' : 'Save Scores'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Attendance Form */}
        {activeTab === 'attendance' && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: '700', marginBottom: '24px' }}>
              Log Attendance
            </h3>
            <form onSubmit={handleAttendanceSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <label style={labelStyle}>Subject</label>
                  <select className="input-field"
                    value={attendanceForm.subject_id}
                    onChange={e => setAttendanceForm({ ...attendanceForm, subject_id: e.target.value })}
                    required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name} ({s.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Semester</label>
                  <select className="input-field"
                    value={attendanceForm.semester_id}
                    onChange={e => setAttendanceForm({ ...attendanceForm, semester_id: e.target.value })}
                    required>
                    <option value="">Select Semester</option>
                    {semesters.map(s => (
                      <option key={s.semester_id} value={s.semester_id}>
                        Semester {s.semester_no} — {s.academic_year} ({s.term})
                      </option>
                    ))}
                  </select>
                </div>

                {[
                  { label: 'Classes Attended', name: 'classes_attended' },
                  { label: 'Total Classes Held', name: 'total_classes' },
                ].map(field => (
                  <div key={field.name}>
                    <label style={labelStyle}>{field.label}</label>
                    <input className="input-field" type="number"
                      name={field.name} min="0" placeholder="Enter number"
                      value={attendanceForm[field.name]}
                      onChange={e => setAttendanceForm({ ...attendanceForm, [e.target.name]: e.target.value })}
                      required />
                  </div>
                ))}

                <button className="btn-primary" type="submit"
                  style={{ width: '100%', padding: '13px', marginTop: '8px', borderRadius: '10px' }}
                  disabled={loading}>
                  {loading ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Study Log Form */}
        {activeTab === 'study' && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: '700', marginBottom: '24px' }}>
              Log Study Hours
            </h3>
            <form onSubmit={handleStudySubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <label style={labelStyle}>Date</label>
                  <input className="input-field" type="date"
                    value={studyForm.log_date}
                    onChange={e => setStudyForm({ ...studyForm, log_date: e.target.value })}
                    required />
                </div>

                <div>
                  <label style={labelStyle}>Hours Studied Today</label>
                  <input className="input-field" type="number"
                    min="0" max="24" step="0.5" placeholder="e.g. 4.5"
                    value={studyForm.hours_studied}
                    onChange={e => setStudyForm({ ...studyForm, hours_studied: e.target.value })}
                    required />
                </div>

                <div>
                  <label style={labelStyle}>Hours Slept Last Night</label>
                  <input className="input-field" type="number"
                    min="0" max="24" step="0.5" placeholder="e.g. 7"
                    value={studyForm.sleep_hours}
                    onChange={e => setStudyForm({ ...studyForm, sleep_hours: e.target.value })}
                    required />
                </div>

                <button className="btn-primary" type="submit"
                  style={{ width: '100%', padding: '13px', marginTop: '8px', borderRadius: '10px' }}
                  disabled={loading}>
                  {loading ? 'Saving...' : 'Save Study Log'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MSRIT Marks Form */}
        {activeTab === 'msrit' && (
          <div className="card fade-in">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '17px', fontWeight: '700', marginBottom: '24px' }}>
              Submit MSRIT Marks
            </h3>
            <form onSubmit={handleMsritSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                  <label style={labelStyle}>Subject</label>
                  <select className="input-field"
                    value={msritForm.subject_id}
                    onChange={e => setMsritForm({ ...msritForm, subject_id: e.target.value })}
                    required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name} ({s.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Semester</label>
                  <select className="input-field"
                    value={msritForm.semester_id}
                    onChange={e => setMsritForm({ ...msritForm, semester_id: e.target.value })}
                    required>
                    <option value="">Select Semester</option>
                    {semesters.map(s => (
                      <option key={s.semester_id} value={s.semester_id}>
                        Semester {s.semester_no} — {s.academic_year} ({s.term})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>CIE 1 Score (0-30)</label>
                  <input className="input-field" type="number"
                    min="0" max="30" placeholder="0 - 30"
                    value={msritForm.cie1_score}
                    onChange={e => {
                      const v = e.target.value === '' ? '' : Math.max(0, Math.min(30, Number(e.target.value)));
                      setMsritForm({ ...msritForm, cie1_score: v === '' ? '' : String(v) });
                    }}
                    required />
                </div>

                <div>
                  <label style={labelStyle}>CIE 2 Score (0-30)</label>
                  <input className="input-field" type="number"
                    min="0" max="30" placeholder="0 - 30"
                    value={msritForm.cie2_score}
                    onChange={e => {
                      const v = e.target.value === '' ? '' : Math.max(0, Math.min(30, Number(e.target.value)));
                      setMsritForm({ ...msritForm, cie2_score: v === '' ? '' : String(v) });
                    }}
                    required />
                </div>

                <div>
                  <label style={labelStyle}>Component 1 Score (0-10)</label>
                  <input className="input-field" type="number"
                    min="0" max="10" placeholder="0 - 10"
                    value={msritForm.component1_score}
                    onChange={e => {
                      const v = e.target.value === '' ? '' : Math.max(0, Math.min(10, Number(e.target.value)));
                      setMsritForm({ ...msritForm, component1_score: v === '' ? '' : String(v) });
                    }}
                    required />
                </div>

                <div>
                  <label style={labelStyle}>Component 2 Score (0-10)</label>
                  <input className="input-field" type="number"
                    min="0" max="10" placeholder="0 - 10"
                    value={msritForm.component2_score}
                    onChange={e => {
                      const v = e.target.value === '' ? '' : Math.max(0, Math.min(10, Number(e.target.value)));
                      setMsritForm({ ...msritForm, component2_score: v === '' ? '' : String(v) });
                    }}
                    required />
                </div>

                {/* Live Preview */}
                {msritPreview && (
                  <div style={{
                    background: 'rgba(96,165,250,0.05)',
                    border: '1px solid rgba(96,165,250,0.3)',
                    padding: '16px', borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#60a5fa', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Live Preview
                    </p>
                    <div className="grid-2">
                      <div>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>Avg CIE</p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>{msritPreview.avg_cie}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>Internal Total /50</p>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#d4af62' }}>{msritPreview.internal_total}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button className="btn-primary" type="submit"
                  style={{ width: '100%', padding: '13px', marginTop: '8px', borderRadius: '10px' }}
                  disabled={loading}>
                  {loading ? 'Saving...' : 'Save MSRIT Marks'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
      </div>
    </div>
  );
}

export default InputPortal;