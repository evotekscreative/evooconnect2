-- +goose Up
-- +goose StatementBegin
CREATE TABLE company_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create unique constraint and indexes
ALTER TABLE company_followers ADD CONSTRAINT unique_company_follower UNIQUE (company_id, user_id);
CREATE INDEX idx_company_followers_company_id ON company_followers(company_id);
CREATE INDEX idx_company_followers_user_id ON company_followers(user_id);
CREATE INDEX idx_company_followers_created_at ON company_followers(created_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS company_followers;
-- +goose StatementEnd