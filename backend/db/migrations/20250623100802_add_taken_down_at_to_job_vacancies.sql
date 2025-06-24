-- +goose Up
-- +goose StatementBegin
ALTER TABLE job_vacancies ADD COLUMN taken_down_at TIMESTAMP NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE job_vacancies DROP COLUMN IF EXISTS taken_down_at;
-- +goose StatementEnd