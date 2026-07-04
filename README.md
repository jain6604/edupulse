# EduPulse — AI-Powered Student Performance Analytics

> Built for MS Ramaiah Institute of Technology (MSRIT) | Powered by FastAPI + React + PostgreSQL + Gemini AI

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## 🎯 What is EduPulse?
EduPulse is a full-stack student performance intelligence platform built specifically for MSRIT students. It combines data engineering, machine learning, and AI to give students personalized academic insights, risk predictions, and career guidance — all in one place.

## ✨ Key Features
- 📊 **Interactive Dashboard** — Real-time GPA, attendance, placement score, batch rank with animated charts
- 🤖 **ML Risk Prediction** — Random Forest classifier predicts LOW/MEDIUM/HIGH academic risk
- 💬 **AI Chat Assistant** — Gemini-powered advisor with full student context awareness
- 📈 **Batch Insights** — Compare your performance against 23+ batchmates with correlation analysis
- 🎯 **Placement Intelligence** — Placement readiness score with strong/weak area breakdown
- 📚 **MSRIT Curriculum** — 471 real subjects across 15 branches and 8 semesters
- 🔄 **Automated ETL Pipeline** — Runs every 30 minutes with data quality monitoring
- 📋 **Resume Upload + ATS Checker** — Upload resume and check with top ATS platforms
- 🏆 **Skills & Achievements Tracker** — Track technical skills and accomplishments
- 🔒 **Secure Auth** — JWT authentication with role-based access (Student/Admin)

## 🏗️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Recharts, Tailwind-inspired CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ML | Scikit-learn (Random Forest + Linear Regression) |
| AI | Google Gemini API (gemini-2.5-flash-lite) |
| ETL | Custom pipeline with APScheduler |
| Auth | JWT (python-jose) |
| Deployment | Render (backend) + Vercel (frontend) |

## 📁 Project Structure
```text
edupulse/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy models
│   ├── database.py          # DB connection
│   ├── routes/              # API endpoints
│   │   ├── students.py      # Auth, profile, photo/resume upload
│   │   ├── analytics.py     # GPA, CGPA, subjects, predictions
│   │   ├── insights.py      # Batch comparison, correlations
│   │   ├── chat.py          # Gemini AI chat
│   │   ├── msrit_scores.py  # MSRIT marking scheme
│   │   ├── data_quality.py  # ETL monitoring
│   │   ├── attendance.py    # Attendance tracking
│   │   ├── recommendations.py # AI recommendations
│   │   ├── reports.py       # Report generation
│   │   ├── scores.py        # Score management
│   │   └── subjects.py      # Curriculum management
│   ├── pipeline/
│   │   ├── etl.py           # ETL pipeline
│   │   └── predictor.py     # ML risk predictor
│   └── uploads/             # Student photos and resumes
├── frontend/
│   ├── src/
│   │   ├── pages/           # All page components
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API calls
│   │   └── context/         # Auth context
│   └── public/
└── powerbi/
    └── edupulse_dashboard.pbix  # Power BI dashboard
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Google Gemini API key (free at aistudio.google.com)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `.env` file:
```ini
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/edupulse
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your_gemini_api_key
```

```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
```bash
# Create database
createdb edupulse

# Tables auto-created on first backend run

# Seed sample data
python seed_20_students.py
python calculate_placement_scores.py
python run_predictions.py
```

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | arjun.1ms22cs001@msrit.edu | Student@123 |
| Admin | admin@msrit.edu | 6604 |

## 📊 MSRIT Marking Scheme
| Component | Marks |
|-----------|-------|
| CIE 1 | /30 |
| CIE 2 | /30 |
| Average CIE | /30 |
| Component 1 + 2 | /20 |
| Internal Total | /50 |
| SEE (converted) | /50 |
| Final Total | /100 |

## 🤖 ML Model
- **Algorithm:** Random Forest Classifier + Linear Regression
- **Features:** Attendance %, Study hours, Sleep hours, CIE scores, Assignment scores
- **Output:** Risk level (LOW/MEDIUM/HIGH) + Predicted GPA
- **Key Insight:** Attendance decline is 46.83x more predictive of HIGH risk than score decline (discovered via Power BI Key Influencers AI)

## 📈 Power BI Dashboard
A professional 5-page Power BI dashboard is included at `powerbi/edupulse_dashboard.pbix`:
- Batch Overview
- Academic Performance
- Risk & Attendance
- Placement Intelligence
- Risk Analytics

## 🏫 Supported Branches (15 MSRIT Departments)
`CSE` | `ISE` | `ECE` | `EEE` | `ETE` | `EIE` | `ME` | `CV` | `CH` | `BT` | `AS` | `ME_MD` | `AIML` | `CSCY` | `AIDS`

## 🔐 Security
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (Student vs Admin)
- Environment variables for all secrets
- `.env` file excluded from version control

## 📝 API Documentation
Once backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

**👨‍💻 Developer:** Built by Saksham Jain | MSRIT Student  
**📄 License:** MIT License — feel free to use and modify
