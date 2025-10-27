-- Support Service Database Schema
CREATE SCHEMA IF NOT EXISTS support;

-- Support Sessions Table
CREATE TABLE IF NOT EXISTS support.support_sessions
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID NOT NULL,
    instructor_id UUID,
    is_closed     BOOLEAN          DEFAULT FALSE,
    created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    closed_at     TIMESTAMP
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS support.support_messages
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    UUID    NOT NULL REFERENCES support.support_sessions (id) ON DELETE CASCADE,
    sender_id     UUID    NOT NULL,
    content       TEXT    NOT NULL,
    is_instructor BOOLEAN NOT NULL,
    is_read       BOOLEAN          DEFAULT FALSE,
    created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_sessions_student_id ON support.support_sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_instructor_id ON support.support_sessions (instructor_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_is_closed ON support.support_sessions (is_closed);
CREATE INDEX IF NOT EXISTS idx_support_messages_session_id ON support.support_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support.support_messages (created_at);
