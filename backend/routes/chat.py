from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import os
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv

router = APIRouter()

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ChatRequest(BaseModel):
    message: str

@router.post("/{student_id}")
def chat_with_ai(student_id: str, request: ChatRequest, db: Session = Depends(get_db)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is missing. Please configure GEMINI_API_KEY in .env")

    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to configure Gemini: {str(e)}")

    # Fetch real student data
    student = db.query(models.DimStudent).filter(models.DimStudent.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_perf = db.query(models.PerformanceSummary).filter(models.PerformanceSummary.student_id == student_id).first()
    placement = db.query(models.PlacementScores).filter(models.PlacementScores.student_id == student_id).first()
    
    student_data = {
        'name': student.name if student else 'Student',
        'branch': student.branch if student else 'N/A',
        'gpa': round(float(student_perf.gpa), 2) if student_perf and student_perf.gpa else 'N/A',
        'attendance': round(float(student_perf.avg_attendance), 1) if student_perf and student_perf.avg_attendance else 'N/A',
        'risk_level': student_perf.risk_level if student_perf else 'N/A',
        'placement_score': round(float(placement.score), 1) if placement and placement.score else 'N/A',
    }

    print(f"Student context: {student_data}")

    system_instruction = f"""You are EduPulse AI, a smart and friendly academic advisor for {student_data['name']} at MS Ramaiah Institute of Technology.

STUDENT DATA:
- Name: {student_data['name']}
- Branch: {student_data['branch']}
- GPA: {student_data['gpa']}
- Attendance: {student_data['attendance']}%
- Risk Level: {student_data['risk_level']}
- Placement Score: {student_data['placement_score']}/100
- Semester: 7

APP NAVIGATION GUIDE (tell users exactly where to go):
- Dashboard (home): Overview stats, score trend, risk distribution, placement gauge, subject performance charts, AI insights
- Insights page (click Insights in sidebar): Batch comparison, your rank vs 23 students, data patterns, correlation insights, batch risk distribution
- Placement page (click Placement icon in sidebar): Placement readiness score, strong areas, weak areas, recommendations
- Skills page (click Skills icon in sidebar): Add technical skills, set proficiency level, view all your skills
- Achievements page (click Achievements icon in sidebar): Add competitions, certifications, projects, awards
- Profile page (click Profile icon in sidebar): Update photo, upload resume, check ATS resume checkers, view your complete academic summary
- Chat (this window): Ask me anything about your performance, how to improve, or where to find features

RULES:
- Always respond in maximum 2-3 short sentences
- When user asks how to do something, tell them exactly which page and what to click
- Reference the student's actual numbers when relevant
- Be encouraging but honest
- If risk is HIGH or MEDIUM, prioritize actionable advice
- Never write long paragraphs
"""

    try:
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash-lite',
            system_instruction=system_instruction,
            generation_config={"max_output_tokens": 300}
        )
        chat = model.start_chat(history=[])
        response = chat.send_message(request.message, request_options={"timeout": 15})
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with AI: {str(e)}")
