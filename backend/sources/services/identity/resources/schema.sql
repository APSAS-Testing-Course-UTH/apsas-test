-- Identity Service Database Schema
CREATE SCHEMA IF NOT EXISTS identity;

-- Users Table
CREATE TABLE IF NOT EXISTS identity.users
(
    id
    UUID
    PRIMARY
    KEY
    DEFAULT
    gen_random_uuid
(
),
    email VARCHAR
(
    255
) UNIQUE NOT NULL,
    password_hash VARCHAR
(
    255
) NOT NULL,
    first_name VARCHAR
(
    100
) NOT NULL,
    last_name VARCHAR
(
    100
) NOT NULL,
    role VARCHAR
(
    50
) NOT NULL CHECK
(
    role
    IN
(
    'STUDENT',
    'INSTRUCTOR',
    'CONTENT_PROVIDER',
    'ADMIN'
)),
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Email Verification Tokens
CREATE TABLE IF NOT EXISTS identity.email_verification_tokens
(
    id
    UUID
    PRIMARY
    KEY
    DEFAULT
    gen_random_uuid
(
),
    user_id UUID NOT NULL REFERENCES identity.users
(
    id
) ON DELETE CASCADE,
    token VARCHAR
(
    255
) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS identity.password_reset_tokens
(
    id
    UUID
    PRIMARY
    KEY
    DEFAULT
    gen_random_uuid
(
),
    user_id UUID NOT NULL REFERENCES identity.users
(
    id
) ON DELETE CASCADE,
    token VARCHAR
(
    255
) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON identity.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON identity.users (role);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON identity.email_verification_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON identity.email_verification_tokens (token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON identity.password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON identity.password_reset_tokens (token);