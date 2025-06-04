-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS company_edit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    requested_changes TEXT NOT NULL,
    current_data TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
    
    CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_edit_requests_company_id ON company_edit_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_company_edit_requests_user_id ON company_edit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_company_edit_requests_status ON company_edit_requests(status);
CREATE INDEX IF NOT EXISTS idx_company_edit_requests_created_at ON company_edit_requests(created_at DESC);

-- Index for checking pending edits
CREATE INDEX IF NOT EXISTS idx_company_edit_requests_pending ON company_edit_requests(company_id, status) WHERE status = 'pending';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS company_edit_requests;
-- +goose StatementEnd