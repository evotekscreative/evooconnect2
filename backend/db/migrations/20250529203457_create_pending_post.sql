-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS pending_posts (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL,
    group_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS pending_posts;
-- +goose StatementEnd
