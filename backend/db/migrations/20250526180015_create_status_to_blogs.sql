-- +goose Up
-- +goose StatementBegin
ALTER TABLE tb_blog ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
COMMENT ON COLUMN tb_blog.status IS 'Status blog: active, taken_down';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE tb_blog DROP COLUMN IF EXISTS status;
-- +goose StatementEnd
