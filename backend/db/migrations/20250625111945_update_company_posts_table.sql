-- +goose Up
-- +goose StatementBegin
ALTER TABLE company_posts ADD COLUMN status VARCHAR(20) DEFAULT 'published';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE company_posts DROP COLUMN IF EXISTS status;
-- +goose StatementEnd
