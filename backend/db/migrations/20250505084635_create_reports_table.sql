-- +goose Up
-- +goose StatementBegin
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (
        target_type IN ('user', 'post', 'comment', 'blog', 'comment_blog')
    ),
    target_id TEXT NOT NULL,  -- Diubah dari UUID menjadi TEXT agar bisa menerima semua format ID
    reason TEXT NOT NULL,
    other_reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'rejected')
    ),
    created_at TIMESTAMP DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE reports;
-- +goose StatementEnd
