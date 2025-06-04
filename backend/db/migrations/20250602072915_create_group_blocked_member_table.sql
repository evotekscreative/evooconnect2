-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS group_blocked_members (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_by UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    expires_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_blocked_members_group_id ON group_blocked_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_blocked_members_user_id ON group_blocked_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_blocked_members_is_active ON group_blocked_members(is_active);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS group_blocked_members;
-- +goose StatementEnd