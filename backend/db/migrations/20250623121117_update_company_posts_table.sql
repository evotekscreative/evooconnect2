-- +goose Up
-- +goose StatementBegin
-- drop title column if it exists
ALTER TABLE company_posts
DROP COLUMN IF EXISTS title;

-- drop status column if it exists
ALTER TABLE company_posts
DROP COLUMN IF EXISTS status;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- add title column back
ALTER TABLE company_posts
ADD COLUMN title VARCHAR(255) NOT NULL;
-- add status column back
ALTER TABLE company_posts
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'draft';
-- +goose StatementEnd
