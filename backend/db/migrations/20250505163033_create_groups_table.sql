-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rule TEXT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image VARCHAR(255),
    privacy_level VARCHAR(20) NOT NULL DEFAULT 'public',
    invite_policy VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_groups_privacy_level ON groups(privacy_level);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS groups;
DROP INDEX IF EXISTS idx_groups_creator_id;
DROP INDEX IF EXISTS idx_groups_privacy_level;
-- +goose StatementEnd
