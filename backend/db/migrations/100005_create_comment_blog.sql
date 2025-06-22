-- SQLBook: Code
-- +goose Up
-- +goose StatementBegin
CREATE TABLE comment_blog (
    id UUID PRIMARY KEY,
    blog_id UUID NOT NULL REFERENCES tb_blog(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID NULL REFERENCES comment_blog(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_comment_blog_blog_id ON comment_blog(blog_id);
CREATE INDEX idx_comment_blog_user_id ON comment_blog(user_id);
-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS comment_blog CASCADE;
-- +goose StatementEnd
