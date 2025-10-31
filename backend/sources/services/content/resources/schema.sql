-- Content Service Database Schema
CREATE SCHEMA IF NOT EXISTS content;

-- Skills Table
CREATE TABLE IF NOT EXISTS content.skills
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS content.assignments
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(255)  NOT NULL,
    description      TEXT          NOT NULL,
    difficulty_level VARCHAR(50)   NOT NULL CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
    creator_id       UUID          NOT NULL,
    created_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    start_date       TIMESTAMP,
    due_date         TIMESTAMP,
    max_score        DECIMAL(5, 2) NOT NULL,
    status           VARCHAR(50)   NOT NULL CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    languages        JSONB         NOT NULL,
    test_cases       JSONB         NOT NULL
);

-- Tutorials Table
CREATE TABLE IF NOT EXISTS content.tutorials
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title      VARCHAR(255) NOT NULL,
    content    TEXT         NOT NULL,
    creator_id UUID         NOT NULL,
    created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    tags       JSONB
);

-- Assignment-Skill Association Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS content.assignment_skills
(
    assignment_id UUID NOT NULL REFERENCES content.assignments (id) ON DELETE CASCADE,
    skill_id      UUID NOT NULL REFERENCES content.skills (id) ON DELETE CASCADE,
    PRIMARY KEY (assignment_id, skill_id)
);

-- Assignment-Tutorial Association Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS content.assignment_tutorials
(
    assignment_id UUID NOT NULL REFERENCES content.assignments (id) ON DELETE CASCADE,
    tutorial_id   UUID NOT NULL REFERENCES content.tutorials (id) ON DELETE CASCADE,
    PRIMARY KEY (assignment_id, tutorial_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_creator_id ON content.assignments (creator_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON content.assignments (status);
CREATE INDEX IF NOT EXISTS idx_assignments_difficulty_level ON content.assignments (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_assignments_start_date ON content.assignments (start_date);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON content.assignments (due_date);
CREATE INDEX IF NOT EXISTS idx_tutorials_creator_id ON content.tutorials (creator_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON content.skills (name);
CREATE INDEX IF NOT EXISTS idx_assignment_skills_assignment_id ON content.assignment_skills (assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_skills_skill_id ON content.assignment_skills (skill_id);
CREATE INDEX IF NOT EXISTS idx_assignment_tutorials_assignment_id ON content.assignment_tutorials (assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_tutorials_tutorial_id ON content.assignment_tutorials (tutorial_id);