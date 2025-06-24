-- +goose Up
-- +goose StatementBegin
CREATE TABLE group_pinned_posts (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    pinned_by UUID NOT NULL REFERENCES users(id),
    pinned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(group_id, post_id)
);

CREATE INDEX idx_group_pinned_posts_group_id ON group_pinned_posts(group_id);
CREATE INDEX idx_group_pinned_posts_post_id ON group_pinned_posts(post_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS group_pinned_posts;
-- +goose StatementEnd
