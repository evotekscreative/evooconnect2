-- +goose Up
-- +goose StatementBegin
-- Hapus constraint lama
ALTER TABLE company_posts DROP CONSTRAINT IF EXISTS company_posts_status_check;

-- Tambahkan constraint baru dengan nilai "taken_down"
ALTER TABLE company_posts ADD CONSTRAINT company_posts_status_check 
CHECK (status IN ('draft', 'published', 'archived', 'taken_down'));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Hapus constraint baru
ALTER TABLE company_posts DROP CONSTRAINT IF EXISTS company_posts_status_check;

-- Kembalikan constraint lama tanpa nilai "taken_down"
ALTER TABLE company_posts ADD CONSTRAINT company_posts_status_check 
CHECK (status IN ('draft', 'published', 'archived'));
-- +goose StatementEnd