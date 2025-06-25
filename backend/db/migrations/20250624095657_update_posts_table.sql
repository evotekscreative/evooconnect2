-- +goose Up
-- +goose StatementBegin

-- First, add the column without default if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'status') THEN
        ALTER TABLE posts ADD COLUMN status VARCHAR(20);
    END IF;
END $$;

-- Then set default value and NOT NULL constraint
ALTER TABLE posts ALTER COLUMN status SET DEFAULT 'approved';
UPDATE posts SET status = 'approved' WHERE status IS NULL;
ALTER TABLE posts ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.reports
ALTER COLUMN target_id TYPE text
USING target_id::text;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE posts DROP COLUMN IF EXISTS status;

ALTER TABLE public.reports
ALTER COLUMN target_id TYPE uuid
USING target_id::uuid;
-- +goose StatementEnd