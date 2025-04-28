-- +goose Up
-- +goose StatementBegin
-- Create user_experiences table
CREATE TABLE IF NOT EXISTS user_experiences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    start_month TEXT NOT NULL,
    start_year TEXT NOT NULL,
    end_month TEXT,
    end_year TEXT,
    caption TEXT,
    photo TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON user_experiences(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_experiences;
DROP INDEX IF EXISTS idx_experiences_user_id;
-- +goose StatementEnd