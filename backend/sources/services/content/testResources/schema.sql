CREATE SCHEMA IF NOT EXISTS content;

CREATE TABLE IF NOT EXISTS content.skills
(
    id          UUID DEFAULT random_uuid() PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    description CLOB,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.assignments
(
    id               UUID DEFAULT random_uuid() PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      CLOB NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    creator_id       UUID NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_date       TIMESTAMP,
    due_date         TIMESTAMP,
    max_score        DECIMAL(5, 2) NOT NULL,
    status           VARCHAR(50) NOT NULL,
    languages        CLOB NOT NULL,
    test_cases       CLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS content.tutorials
(
    id         UUID DEFAULT random_uuid() PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    CLOB NOT NULL,
    creator_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tags       CLOB
);

CREATE TABLE IF NOT EXISTS content.assignment_skills
(
    assignment_id UUID NOT NULL,
    skill_id      UUID NOT NULL,
    PRIMARY KEY (assignment_id, skill_id),
    CONSTRAINT fk_assignment_skills_assignment FOREIGN KEY (assignment_id)
        REFERENCES content.assignments (id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_skills_skill FOREIGN KEY (skill_id)
        REFERENCES content.skills (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content.assignment_tutorials
(
    assignment_id UUID NOT NULL,
    tutorial_id   UUID NOT NULL,
    PRIMARY KEY (assignment_id, tutorial_id),
    CONSTRAINT fk_assignment_tutorials_assignment FOREIGN KEY (assignment_id)
        REFERENCES content.assignments (id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_tutorials_tutorial FOREIGN KEY (tutorial_id)
        REFERENCES content.tutorials (id) ON DELETE CASCADE
);
