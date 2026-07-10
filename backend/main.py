from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database import engine, Base
import models
from routes import students, scores, attendance, analytics, recommendations, reports, subjects, msrit_scores, insights, chat, data_quality
from apscheduler.schedulers.background import BackgroundScheduler
from pipeline.etl import run_pipeline
from pipeline_state import pipeline_status, set_pipeline_status
import datetime

# Create all tables if they don't exist
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="EduPulse API",
    description="AI-Powered Student Performance Analytics",
    version="1.0.0"
)

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    # Allow local frontend origins and live/preview Vercel origins
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://edupulse-sandy-nu.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads/photos", exist_ok=True)
os.makedirs("uploads/resumes", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include all routes
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(scores.router, prefix="/api/scores", tags=["Scores"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(msrit_scores.router, prefix="/api/msrit-scores", tags=["MSRIT Scores"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat Assistant"])
app.include_router(data_quality.router, prefix="/api/data-quality", tags=["Data Quality"])

scheduler = BackgroundScheduler()

def scheduled_pipeline():
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting scheduled ETL pipeline...")
    try:
        run_pipeline()
        set_pipeline_status("Success")
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduled ETL pipeline completed successfully.")
    except Exception as e:
        set_pipeline_status(f"Failed: {str(e)}")
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scheduled ETL pipeline failed: {str(e)}")

@app.on_event("startup")
def startup_event():
    scheduler.add_job(scheduled_pipeline, 'interval', minutes=30)
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

@app.get("/api/analytics/pipeline/status")
def get_pipeline_status():
    return pipeline_status

@app.get("/")
def root():
    return {"message": "EduPulse API is running 🚀"}