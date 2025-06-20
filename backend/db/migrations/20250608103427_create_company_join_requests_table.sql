-- +goose Up
-- +goose StatementBegin
CREATE TABLE company_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responsed_at TIMESTAMP NULL,
    response_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_company_join_requests_user_id ON company_join_requests(user_id);
CREATE INDEX idx_company_join_requests_company_id ON company_join_requests(company_id);
CREATE INDEX idx_company_join_requests_status ON company_join_requests(status);
CREATE INDEX idx_company_join_requests_user_company ON company_join_requests(user_id, company_id);

-- Prevent duplicate pending requests
CREATE UNIQUE INDEX idx_company_join_requests_unique_pending 
ON company_join_requests(user_id, company_id) 
WHERE status = 'pending';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS company_join_requests;
-- +goose StatementEnd
