import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from database import SessionLocal
from models import DimStudent, RawScores, RawAttendance, RawStudyLogs, StudentSkills, Achievements, PerformanceSummary, RiskScores, MsritScores, DimSubject
from datetime import datetime

def get_db():
    return SessionLocal()

# ============================================
# GENERATE PDF REPORT
# ============================================

def generate_report(student_id: str):
    db = get_db()
    try:
        # Get student data
        student = db.query(DimStudent).filter(DimStudent.student_id == student_id).first()
        if not student:
            return {"error": "Student not found"}

        # Get all data
        msrit_scores = db.query(MsritScores).filter(MsritScores.student_id == student_id).all()
        scores      = db.query(RawScores).filter(RawScores.student_id == student_id).all()
        attendance  = db.query(RawAttendance).filter(RawAttendance.student_id == student_id).all()
        logs        = db.query(RawStudyLogs).filter(RawStudyLogs.student_id == student_id).all()
        skills      = db.query(StudentSkills).filter(StudentSkills.student_id == student_id).all()
        achievements = db.query(Achievements).filter(Achievements.student_id == student_id).all()
        summary     = db.query(PerformanceSummary).filter(PerformanceSummary.student_id == student_id).first()
        risk        = db.query(RiskScores).filter(RiskScores.student_id == student_id).first()

        # Calculate metrics
        if msrit_scores:
            avg_score = round(sum(float(s.final_total or 0) for s in msrit_scores) / len(msrit_scores), 2) if msrit_scores else 0
        else:
            avg_score = round(sum(
                float(s.assignment_score or 0)*0.2 +
                float(s.midterm_score or 0)*0.3 +
                float(s.final_score or 0)*0.5
                for s in scores) / len(scores), 2) if scores else 0

        attendance_pct = round(
            (sum(a.classes_attended for a in attendance) /
             sum(a.total_classes for a in attendance)) * 100, 2
        ) if attendance else 0

        avg_study = round(sum(float(l.hours_studied or 0) for l in logs) / len(logs), 2) if logs else 0
        avg_sleep = round(sum(float(l.sleep_hours or 0) for l in logs) / len(logs), 2) if logs else 0
        gpa = round((avg_score / 100) * 10, 2)
        risk_level = risk.risk_level if risk else "N/A"

        # Create PDF
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'reports')
        os.makedirs(output_dir, exist_ok=True)
        filename = f"report_{student.name.replace(' ', '_')}_{datetime.now().strftime('%Y%m')}.pdf"
        filepath = os.path.join(output_dir, filename)

        doc = SimpleDocTemplate(filepath, pagesize=A4,
                                rightMargin=40, leftMargin=40,
                                topMargin=40, bottomMargin=40)

        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('title', fontSize=24, fontName='Helvetica-Bold',
                                     textColor=colors.HexColor('#1d4ed8'), alignment=TA_CENTER)
        subtitle_style = ParagraphStyle('subtitle', fontSize=12, fontName='Helvetica',
                                        textColor=colors.HexColor('#64748b'), alignment=TA_CENTER)
        section_style = ParagraphStyle('section', fontSize=14, fontName='Helvetica-Bold',
                                       textColor=colors.HexColor('#1e293b'), spaceBefore=16)
        normal_style = ParagraphStyle('normal', fontSize=11, fontName='Helvetica',
                                      textColor=colors.HexColor('#334155'))

        content = []

        # ---- HEADER ----
        content.append(Paragraph("EduPulse", title_style))
        content.append(Paragraph("Student Performance Report", subtitle_style))
        content.append(Spacer(1, 8))
        content.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1d4ed8')))
        content.append(Spacer(1, 16))

        # ---- STUDENT INFO ----
        content.append(Paragraph("Student Information", section_style))
        content.append(Spacer(1, 8))

        info_data = [
            ['Name', student.name, 'Branch', student.branch],
            ['Email', student.email, 'Hostel', student.hostel or 'N/A'],
            ['Year of Joining', str(student.year_of_joining), 'Report Date', datetime.now().strftime('%d %B %Y')],
        ]
        info_table = Table(info_data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#eff6ff')),
            ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#eff6ff')),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ]))
        content.append(info_table)
        content.append(Spacer(1, 20))

        # ---- PERFORMANCE SUMMARY ----
        content.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0')))
        content.append(Spacer(1, 8))
        content.append(Paragraph("Performance Summary", section_style))
        content.append(Spacer(1, 8))

        perf_data = [
            ['Metric', 'Value', 'Status'],
            ['Average Score', f'{avg_score}%',
             '✓ Good' if avg_score >= 70 else '⚠ Needs Improvement'],
            ['Attendance', f'{attendance_pct}%',
             '✓ Good' if attendance_pct >= 75 else '⚠ Below Required'],
            ['Predicted GPA', f'{gpa}/10',
             '✓ Good' if gpa >= 7 else '⚠ Needs Improvement'],
            ['Avg Study Hours', f'{avg_study} hrs/day',
             '✓ Good' if avg_study >= 4 else '⚠ Study More'],
            ['Avg Sleep Hours', f'{avg_sleep} hrs/day',
             '✓ Good' if 6 <= avg_sleep <= 8 else '⚠ Adjust Sleep'],
            ['Risk Level', risk_level,
             '✓ Low Risk' if risk_level == 'LOW' else '⚠ At Risk'],
        ]

        perf_table = Table(perf_data, colWidths=[2.5*inch, 2*inch, 2.5*inch])
        perf_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1d4ed8')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ]))
        content.append(perf_table)
        content.append(Spacer(1, 20))

        # ---- SCORES BREAKDOWN ----
        if msrit_scores:
            content.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0')))
            content.append(Spacer(1, 8))
            content.append(Paragraph("Scores Breakdown (MSRIT Scheme)", section_style))
            content.append(Spacer(1, 8))

            score_data = [['Subject', 'CIE 1', 'CIE 2', 'Internals', 'SEE', 'Total']]
            for s in msrit_scores:
                subject = db.query(DimSubject).filter(DimSubject.subject_id == s.subject_id).first()
                sub_name = subject.subject_name if subject else "Unknown"
                score_data.append([
                    sub_name,
                    str(s.cie1_score or 0),
                    str(s.cie2_score or 0),
                    str(s.internal_total or 0),
                    str(s.see_score or 'N/A'),
                    str(s.final_total or 'N/A')
                ])

            score_table = Table(score_data, colWidths=[2.2*inch, 0.9*inch, 0.9*inch, 0.9*inch, 0.9*inch, 1.2*inch])
            score_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
                ('FONTSIZE', (0,0), (-1,-1), 9),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('PADDING', (0,0), (-1,-1), 6),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('ALIGN', (0,1), (0,-1), 'LEFT'),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ]))
            content.append(score_table)
            content.append(Spacer(1, 20))
        elif scores:
            content.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0')))
            content.append(Spacer(1, 8))
            content.append(Paragraph("Scores Breakdown", section_style))
            content.append(Spacer(1, 8))

            score_data = [['#', 'Assignment', 'Midterm', 'Final', 'Total']]
            for i, s in enumerate(scores, 1):
                total = round(float(s.assignment_score or 0)*0.2 +
                              float(s.midterm_score or 0)*0.3 +
                              float(s.final_score or 0)*0.5, 2)
                score_data.append([
                    str(i),
                    str(s.assignment_score),
                    str(s.midterm_score),
                    str(s.final_score),
                    str(total)
                ])

            score_table = Table(score_data, colWidths=[0.5*inch, 1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            score_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
                ('FONTSIZE', (0,0), (-1,-1), 10),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('PADDING', (0,0), (-1,-1), 8),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ]))
            content.append(score_table)
            content.append(Spacer(1, 20))

        # ---- SKILLS ----
        if skills:
            content.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0')))
            content.append(Spacer(1, 8))
            content.append(Paragraph("Skills", section_style))
            content.append(Spacer(1, 8))
            skill_text = ", ".join([f"{s.skill_name} ({s.proficiency}/10)" for s in skills])
            content.append(Paragraph(skill_text, normal_style))
            content.append(Spacer(1, 20))

        # ---- ACHIEVEMENTS ----
        if achievements:
            content.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0')))
            content.append(Spacer(1, 8))
            content.append(Paragraph("Achievements", section_style))
            content.append(Spacer(1, 8))
            for a in achievements:
                content.append(Paragraph(f"• {a.title} ({a.type}) — {a.date}", normal_style))
            content.append(Spacer(1, 20))

        # ---- FOOTER ----
        content.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1d4ed8')))
        content.append(Spacer(1, 8))
        content.append(Paragraph(
            f"Generated by EduPulse on {datetime.now().strftime('%d %B %Y at %H:%M')}",
            subtitle_style
        ))

        # Build PDF
        doc.build(content)

        return {
            "success": True,
            "filename": filename,
            "filepath": filepath,
            "student_name": student.name
        }

    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


if __name__ == "__main__":
    student_id = input("Enter student ID: ")
    result = generate_report(student_id)
    print(result)