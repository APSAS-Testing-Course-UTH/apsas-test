-- Create notification schema
CREATE SCHEMA IF NOT EXISTS notification;

-- Device tokens for push notifications
CREATE TABLE IF NOT EXISTS notification.device_tokens
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    device_type VARCHAR(20)  NOT NULL,
    user_agent  VARCHAR(500),
    is_active   BOOLEAN          DEFAULT true,
    created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON notification.device_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON notification.device_tokens (is_active);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification.preferences
(
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID NOT NULL UNIQUE,
    email_enabled              BOOLEAN          DEFAULT true,
    push_enabled               BOOLEAN          DEFAULT true,

    -- Email preferences by type
    email_assignment_published BOOLEAN          DEFAULT true,
    email_submission_evaluated BOOLEAN          DEFAULT true,

    -- Push preferences by type
    push_assignment_published  BOOLEAN          DEFAULT true,
    push_submission_evaluated  BOOLEAN          DEFAULT true,

    created_at                 TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at                 TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON notification.preferences (user_id);
