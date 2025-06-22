-- +goose Up
-- +goose StatementBegin
ALTER TABLE comment_blog ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
COMMENT ON COLUMN comment_blog.status IS 'Status comment blog: active, taken_down';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE comment_blog DROP COLUMN IF EXISTS status;
-- +goose StatementEnd
