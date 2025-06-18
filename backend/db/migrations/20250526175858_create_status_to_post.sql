-- +goose Up
-- +goose StatementBegin
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
COMMENT ON COLUMN posts.status IS 'Status post: active, taken_down';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE posts DROP COLUMN IF EXISTS status;
-- +goose StatementEnd
