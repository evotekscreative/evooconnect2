-- +goose Up
-- +goose StatementBegin
ALTER TABLE comments ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
COMMENT ON COLUMN comments.status IS 'Status comment: active, taken_down';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE comments DROP COLUMN IF EXISTS status;
-- +goose StatementEnd
