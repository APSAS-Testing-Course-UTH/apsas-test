-- Submission Service Database Schema
CREATE SCHEMA IF NOT EXISTS submission;

-- Submissions Table
CREATE TABLE IF NOT EXISTS submission.submissions
(
    id                UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    assignment_id     UUID         NOT NULL,
    student_id        UUID         NOT NULL,
    submitted_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status            VARCHAR(50)  NOT NULL CHECK (status IN ('PENDING', 'EVALUATED', 'FAILED')),
    code              TEXT         NOT NULL,
    language          VARCHAR(100) NOT NULL,
    result            VARCHAR(50) CHECK (result IN ('PASSED', 'FAILED', 'PARTIAL')),
    score             DECIMAL(5, 2),
    test_case_results JSONB,
    evaluated_at      TIMESTAMP,
    feedback          TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submission.submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submission.submissions (student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submission.submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submission.submissions (submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_student ON submission.submissions (assignment_id, student_id);
