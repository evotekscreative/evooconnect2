-- +goose Up
-- +goose StatementBegin

-- Drop any triggers that might be updating application_count
DROP TRIGGER IF EXISTS update_job_vacancy_application_count ON job_applications;
DROP TRIGGER IF EXISTS increment_application_count ON job_applications;
DROP TRIGGER IF EXISTS decrement_application_count ON job_applications;

-- Drop any trigger functions that reference application_count
DROP FUNCTION IF EXISTS update_application_count();
DROP FUNCTION IF EXISTS increment_application_count();
DROP FUNCTION IF EXISTS decrement_application_count();

-- Check for any other triggers on job_applications table that might reference application_count
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE event_object_table = 'job_applications'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON ' || trigger_record.event_object_table;
    END LOOP;
END $$;

-- Check what triggers exist on job_applications table
SELECT trigger_name, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'job_applications';

-- Drop any triggers that might be causing the issue
DROP TRIGGER IF EXISTS update_job_vacancy_application_count ON job_applications;
DROP TRIGGER IF EXISTS increment_application_count ON job_applications;
DROP TRIGGER IF EXISTS decrement_application_count ON job_applications;

-- Drop trigger functions
DROP FUNCTION IF EXISTS update_application_count();
DROP FUNCTION IF EXISTS increment_application_count();
DROP FUNCTION IF EXISTS decrement_application_count();

-- Check for any remaining functions that reference application_count
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_definition LIKE '%application_count%' 
AND routine_type = 'FUNCTION';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- This migration removes problematic triggers, so no rollback needed
-- +goose StatementEnd