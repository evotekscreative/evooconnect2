-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS user_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institute_name VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    start_month VARCHAR(20) NOT NULL,
    start_year VARCHAR(4) NOT NULL,
    end_month VARCHAR(20),
    end_year VARCHAR(4),
    caption TEXT,
    photo VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_education_user_id ON user_education(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_education;
-- +goose StatementEnd