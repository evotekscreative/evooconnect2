-- +goose Up
-- +goose StatementBegin
ALTER TABLE tb_blog ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE tb_blog DROP COLUMN IF EXISTS status;
-- +goose StatementEnd
