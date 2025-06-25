-- +goose Up
-- +goose StatementBegin
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_target_type_check;
ALTER TABLE reports ADD CONSTRAINT reports_target_type_check 
CHECK (target_type IN ('user', 'post', 'comment', 'blog', 'comment_blog', 'group', 'company', 'company_post'));
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_target_type_check;
ALTER TABLE reports ADD CONSTRAINT reports_target_type_check 
CHECK (target_type IN ('user', 'post', 'comment', 'blog', 'comment_blog', 'group', 'company'));
-- +goose StatementEnd