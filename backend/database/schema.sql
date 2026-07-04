-- ============================================
-- EDUPULSE DATABASE SCHEMA
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 1: DIMENSION TABLES
-- ============================================

-- Who is the student?
CREATE TABLE dim_student (
    student_id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    branch          VARCHAR(50) NOT NULL,
    hostel          VARCHAR(50),
    year_of_joining INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- What subject?
CREATE TABLE dim_subject (
    subject_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_name VARCHAR(100) NOT NULL,
    branch       VARCHAR(50) NOT NULL,
    credits      INTEGER NOT NULL
);

-- Which semester?
CREATE TABLE dim_semester (
    semester_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_no   INTEGER NOT NULL,   -- 1 to 8
    academic_year VARCHAR(10) NOT NULL,  -- e.g. "2024-25"
    term          VARCHAR(10) NOT NULL   -- "ODD" or "EVEN"
);
-- ============================================
-- PART 2: RAW LAYER
-- ============================================

CREATE TABLE raw_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES dim_student(student_id),
    subject_id      UUID REFERENCES dim_subject(subject_id),
    semester_id     UUID REFERENCES dim_semester(semester_id),
    assignment_score DECIMAL(5,2),
    midterm_score   DECIMAL(5,2),
    final_score     DECIMAL(5,2),
    loaded_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE raw_attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES dim_student(student_id),
    subject_id      UUID REFERENCES dim_subject(subject_id),
    semester_id     UUID REFERENCES dim_semester(semester_id),
    classes_attended INTEGER,
    total_classes    INTEGER,
    loaded_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE raw_study_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES dim_student(student_id),
    log_date        DATE NOT NULL,
    hours_studied   DECIMAL(4,2),
    sleep_hours     DECIMAL(4,2),
    loaded_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE raw_skills (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID REFERENCES dim_student(student_id),
    skill_name      VARCHAR(100) NOT NULL,
    proficiency     INTEGER CHECK (proficiency BETWEEN 1 AND 10),
    loaded_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PART 3: STAGING LAYER
-- ============================================

CREATE TABLE staging_scores (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id       UUID REFERENCES dim_student(student_id),
    subject_id       UUID REFERENCES dim_subject(subject_id),
    semester_id      UUID REFERENCES dim_semester(semester_id),
    assignment_score DECIMAL(5,2) CHECK (assignment_score BETWEEN 0 AND 100),
    midterm_score    DECIMAL(5,2) CHECK (midterm_score BETWEEN 0 AND 100),
    final_score      DECIMAL(5,2) CHECK (final_score BETWEEN 0 AND 100),
    total_score      DECIMAL(5,2),
    is_valid         BOOLEAN DEFAULT TRUE,
    staged_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE staging_attendance (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id       UUID REFERENCES dim_student(student_id),
    subject_id       UUID REFERENCES dim_subject(subject_id),
    semester_id      UUID REFERENCES dim_semester(semester_id),
    classes_attended INTEGER,
    total_classes    INTEGER,
    attendance_pct   DECIMAL(5,2),
    is_valid         BOOLEAN DEFAULT TRUE,
    staged_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE staging_study_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id    UUID REFERENCES dim_student(student_id),
    log_date      DATE NOT NULL,
    hours_studied DECIMAL(4,2) CHECK (hours_studied BETWEEN 0 AND 24),
    sleep_hours   DECIMAL(4,2) CHECK (sleep_hours BETWEEN 0 AND 24),
    is_valid      BOOLEAN DEFAULT TRUE,
    staged_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE staging_skills (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID REFERENCES dim_student(student_id),
    skill_name  VARCHAR(100) NOT NULL,
    proficiency INTEGER CHECK (proficiency BETWEEN 1 AND 10),
    is_valid    BOOLEAN DEFAULT TRUE,
    staged_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PART 4: STAR SCHEMA (ANALYTICS LAYER)
-- ============================================

CREATE TABLE fact_student_performance (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id       UUID REFERENCES dim_student(student_id),
    subject_id       UUID REFERENCES dim_subject(subject_id),
    semester_id      UUID REFERENCES dim_semester(semester_id),
    total_score      DECIMAL(5,2),
    grade            VARCHAR(2),
    attendance_pct   DECIMAL(5,2),
    study_hours_avg  DECIMAL(4,2),
    sleep_hours_avg  DECIMAL(4,2),
    gpa              DECIMAL(3,2),
    risk_level       VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fact_attendance (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id       UUID REFERENCES dim_student(student_id),
    subject_id       UUID REFERENCES dim_subject(subject_id),
    semester_id      UUID REFERENCES dim_semester(semester_id),
    classes_attended INTEGER,
    total_classes    INTEGER,
    attendance_pct   DECIMAL(5,2),
    created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PART 5: ADDITIONAL TABLES
-- ============================================

CREATE TABLE student_skills (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID REFERENCES dim_student(student_id),
    skill_name  VARCHAR(100) NOT NULL,
    proficiency INTEGER CHECK (proficiency BETWEEN 1 AND 10),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE achievements (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID REFERENCES dim_student(student_id),
    type        VARCHAR(50) NOT NULL,   -- Hackathon, Certification, Internship, Sports
    title       VARCHAR(200) NOT NULL,
    date        DATE NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE risk_scores (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID REFERENCES dim_student(student_id),
    semester_id UUID REFERENCES dim_semester(semester_id),
    risk_level  VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_score  DECIMAL(5,2),
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recommendations (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id   UUID REFERENCES dim_student(student_id),
    type         VARCHAR(50),   -- ATTENDANCE, STUDY, SKILL, SLEEP
    message      TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE placement_scores (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id    UUID REFERENCES dim_student(student_id),
    score         DECIMAL(5,2),
    strong_areas  TEXT,
    weak_areas    TEXT,
    generated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE performance_summary (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id        UUID REFERENCES dim_student(student_id),
    semester_id       UUID REFERENCES dim_semester(semester_id),
    avg_score         DECIMAL(5,2),
    avg_attendance    DECIMAL(5,2),
    avg_study_hours   DECIMAL(4,2),
    avg_sleep_hours   DECIMAL(4,2),
    gpa               DECIMAL(3,2),
    risk_level        VARCHAR(10),
    placement_score   DECIMAL(5,2),
    updated_at        TIMESTAMP DEFAULT NOW()
);