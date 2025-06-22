-- SQLBook: Code
-- +goose Up
-- +goose StatementBegin
CREATE TABLE tb_blog (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT, -- Ubah nama kolom untuk lebih spesifik
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_blog_user_id ON tb_blog(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS tb_blog CASCADE;
-- +goose StatementEnd
-- SQLBook: Code