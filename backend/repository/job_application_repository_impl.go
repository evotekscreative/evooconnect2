package repository

import (
	"context"
	"database/sql"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

type JobApplicationRepositoryImpl struct{}

func NewJobApplicationRepository() JobApplicationRepository {
	return &JobApplicationRepositoryImpl{}
}

func (repository *JobApplicationRepositoryImpl) Create(ctx context.Context, tx *sql.Tx, jobApplication domain.JobApplication) domain.JobApplication {
	fmt.Printf("DEBUG: JobApplicationRepository.Create called\n")
	fmt.Printf("DEBUG: Creating job application in repository\n")

	SQL := `INSERT INTO job_applications (id, job_vacancy_id, applicant_id, cv_file_path, contact_info, 
            motivation_letter, cover_letter, expected_salary, available_start_date, status, 
            submitted_at, created_at, updated_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`

	fmt.Printf("DEBUG: About to execute INSERT query\n")
	_, err := tx.ExecContext(ctx, SQL,
		jobApplication.Id, jobApplication.JobVacancyId, jobApplication.ApplicantId,
		jobApplication.CvFilePath, jobApplication.ContactInfo, jobApplication.MotivationLetter,
		jobApplication.CoverLetter, jobApplication.ExpectedSalary, jobApplication.AvailableStartDate,
		jobApplication.Status, jobApplication.SubmittedAt, jobApplication.CreatedAt, jobApplication.UpdatedAt)

	if err != nil {
		fmt.Printf("DEBUG: Error in JobApplicationRepository.Create: %v\n", err)
	} else {
		fmt.Printf("DEBUG: JobApplicationRepository.Create completed successfully\n")
	}

	helper.PanicIfError(err)

	return jobApplication
}

func (repository *JobApplicationRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, jobApplication domain.JobApplication) domain.JobApplication {
	SQL := `UPDATE job_applications SET cv_file_path = $2, contact_info = $3, motivation_letter = $4, 
            cover_letter = $5, expected_salary = $6, available_start_date = $7, status = $8, 
            rejection_reason = $9, notes = $10, reviewed_by = $11, reviewed_at = $12, 
            interview_scheduled_at = $13, updated_at = $14
            WHERE id = $1`

	_, err := tx.ExecContext(ctx, SQL,
		jobApplication.Id, jobApplication.CvFilePath, jobApplication.ContactInfo,
		jobApplication.MotivationLetter, jobApplication.CoverLetter, jobApplication.ExpectedSalary,
		jobApplication.AvailableStartDate, jobApplication.Status, jobApplication.RejectionReason,
		jobApplication.Notes, jobApplication.ReviewedBy, jobApplication.ReviewedAt,
		jobApplication.InterviewScheduledAt, time.Now())
	helper.PanicIfError(err)

	return jobApplication
}

func (repository *JobApplicationRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, jobApplicationId uuid.UUID) error {
	SQL := `DELETE FROM job_applications WHERE id = $1`

	_, err := tx.ExecContext(ctx, SQL, jobApplicationId)
	return err
}

func (repository *JobApplicationRepositoryImpl) FindById(ctx context.Context, tx *sql.Tx, jobApplicationId uuid.UUID) (domain.JobApplication, error) {
	SQL := `SELECT ja.id, ja.job_vacancy_id, ja.applicant_id, ja.cv_file_path, ja.contact_info,
            ja.motivation_letter, ja.cover_letter, ja.expected_salary, ja.available_start_date,
            ja.status, ja.rejection_reason, ja.notes, ja.reviewed_by, ja.reviewed_at,
            ja.interview_scheduled_at, ja.submitted_at, ja.created_at, ja.updated_at,
            jv.title as job_title, jv.company_id, c.name as company_name, c.logo as company_logo,
            a.name as applicant_name, a.username as applicant_username, a.photo as applicant_photo, a.email as applicant_email,
            r.name as reviewer_name, r.username as reviewer_username
            FROM job_applications ja
            LEFT JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id
            LEFT JOIN companies c ON jv.company_id = c.id
            LEFT JOIN users a ON ja.applicant_id = a.id
            LEFT JOIN users r ON ja.reviewed_by = r.id
            WHERE ja.id = $1`

	var jobApplication domain.JobApplication
	var jobVacancy domain.JobVacancy
	var company domain.Company
	var applicant domain.User
	var reviewer domain.User
	var companyLogo, applicantPhoto, reviewerName, reviewerUsername, rejectionReason, notes sql.NullString
	var motivationLetter, coverLetter sql.NullString
	var expectedSalary sql.NullFloat64
	var availableStartDate sql.NullTime

	err := tx.QueryRowContext(ctx, SQL, jobApplicationId).Scan(
		&jobApplication.Id, &jobApplication.JobVacancyId, &jobApplication.ApplicantId,
		&jobApplication.CvFilePath, &jobApplication.ContactInfo, &motivationLetter,
		&coverLetter, &expectedSalary, &availableStartDate,
		&jobApplication.Status, &rejectionReason, &notes,
		&jobApplication.ReviewedBy, &jobApplication.ReviewedAt, &jobApplication.InterviewScheduledAt,
		&jobApplication.SubmittedAt, &jobApplication.CreatedAt, &jobApplication.UpdatedAt,
		&jobVacancy.Title, &jobVacancy.CompanyId, &company.Name, &companyLogo,
		&applicant.Name, &applicant.Username, &applicantPhoto, &applicant.Email,
		&reviewerName, &reviewerUsername)

	if err != nil {
		return jobApplication, err
	}

	// Handle nullable fields
	if motivationLetter.Valid {
		jobApplication.MotivationLetter = &motivationLetter.String
	}
	if coverLetter.Valid {
		jobApplication.CoverLetter = &coverLetter.String
	}
	if expectedSalary.Valid {
		jobApplication.ExpectedSalary = &expectedSalary.Float64
	}
	if availableStartDate.Valid {
		jobApplication.AvailableStartDate = &availableStartDate.Time
	}
	if rejectionReason.Valid {
		jobApplication.RejectionReason = &rejectionReason.String
	}
	if notes.Valid {
		jobApplication.Notes = &notes.String
	}

	// Set relations
	jobVacancy.Id = jobApplication.JobVacancyId
	company.Id = jobVacancy.CompanyId
	if companyLogo.Valid {
		company.Logo = companyLogo.String
	}
	jobVacancy.Company = &company
	jobApplication.JobVacancy = &jobVacancy

	applicant.Id = jobApplication.ApplicantId
	if applicantPhoto.Valid {
		applicant.Photo = applicantPhoto.String
	}
	jobApplication.Applicant = &applicant

	if jobApplication.ReviewedBy != nil {
		reviewer.Id = *jobApplication.ReviewedBy
		if reviewerName.Valid {
			reviewer.Name = reviewerName.String
		}
		if reviewerUsername.Valid {
			reviewer.Username = reviewerUsername.String
		}
		jobApplication.Reviewer = &reviewer
	}

	return jobApplication, nil
}

func (repository *JobApplicationRepositoryImpl) FindByJobVacancyId(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID, status string, limit, offset int) ([]domain.JobApplication, int, error) {
	// Count query
	countSQL := `SELECT COUNT(*) FROM job_applications WHERE job_vacancy_id = $1`
	args := []interface{}{jobVacancyId}

	if status != "" {
		countSQL += ` AND status = $2`
		args = append(args, status)
	}

	var total int
	err := tx.QueryRowContext(ctx, countSQL, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query
	dataSQL := `SELECT ja.id, ja.job_vacancy_id, ja.applicant_id, ja.cv_file_path, ja.contact_info,
                ja.motivation_letter, ja.cover_letter, ja.expected_salary, ja.available_start_date,
                ja.status, ja.rejection_reason, ja.notes, ja.reviewed_by, ja.reviewed_at,
                ja.interview_scheduled_at, ja.submitted_at, ja.created_at, ja.updated_at,
                a.name as applicant_name, a.username as applicant_username, a.photo as applicant_photo, a.email as applicant_email
                FROM job_applications ja
                LEFT JOIN users a ON ja.applicant_id = a.id
                WHERE ja.job_vacancy_id = $1`

	dataArgs := []interface{}{jobVacancyId}

	if status != "" {
		dataSQL += ` AND ja.status = $` + fmt.Sprintf("%d", len(dataArgs)+1)
		dataArgs = append(dataArgs, status)
	}

	dataSQL += ` ORDER BY ja.submitted_at DESC LIMIT $` + fmt.Sprintf("%d", len(dataArgs)+1) +
		` OFFSET $` + fmt.Sprintf("%d", len(dataArgs)+2)
	dataArgs = append(dataArgs, limit, offset)

	rows, err := tx.QueryContext(ctx, dataSQL, dataArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var applications []domain.JobApplication
	for rows.Next() {
		var app domain.JobApplication
		var applicant domain.User
		var applicantPhoto sql.NullString
		var motivationLetter, coverLetter sql.NullString
		var expectedSalary sql.NullFloat64
		var availableStartDate sql.NullTime
		var rejectionReason, notes sql.NullString

		err := rows.Scan(
			&app.Id, &app.JobVacancyId, &app.ApplicantId, &app.CvFilePath, &app.ContactInfo,
			&motivationLetter, &coverLetter, &expectedSalary, &availableStartDate,
			&app.Status, &rejectionReason, &notes, &app.ReviewedBy, &app.ReviewedAt,
			&app.InterviewScheduledAt, &app.SubmittedAt, &app.CreatedAt, &app.UpdatedAt,
			&applicant.Name, &applicant.Username, &applicantPhoto, &applicant.Email)

		if err != nil {
			return nil, 0, err
		}

		// Handle nullable fields
		if motivationLetter.Valid {
			app.MotivationLetter = &motivationLetter.String
		}
		if coverLetter.Valid {
			app.CoverLetter = &coverLetter.String
		}
		if expectedSalary.Valid {
			app.ExpectedSalary = &expectedSalary.Float64
		}
		if availableStartDate.Valid {
			app.AvailableStartDate = &availableStartDate.Time
		}
		if rejectionReason.Valid {
			app.RejectionReason = &rejectionReason.String
		}
		if notes.Valid {
			app.Notes = &notes.String
		}

		// Set applicant relation
		applicant.Id = app.ApplicantId
		if applicantPhoto.Valid {
			applicant.Photo = applicantPhoto.String
		}
		app.Applicant = &applicant

		applications = append(applications, app)
	}

	return applications, total, nil
}

func (repository *JobApplicationRepositoryImpl) FindByApplicantId(ctx context.Context, tx *sql.Tx, applicantId uuid.UUID, status string, limit, offset int) ([]domain.JobApplication, int, error) {
	// Count query
	countSQL := `SELECT COUNT(*) FROM job_applications WHERE applicant_id = $1`
	args := []interface{}{applicantId}

	if status != "" {
		countSQL += ` AND status = $2`
		args = append(args, status)
	}

	var total int
	err := tx.QueryRowContext(ctx, countSQL, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query with job vacancy and company info
	dataSQL := `SELECT ja.id, ja.job_vacancy_id, ja.applicant_id, ja.cv_file_path, ja.contact_info,
                ja.motivation_letter, ja.cover_letter, ja.expected_salary, ja.available_start_date,
                ja.status, ja.rejection_reason, ja.notes, ja.reviewed_by, ja.reviewed_at,
                ja.interview_scheduled_at, ja.submitted_at, ja.created_at, ja.updated_at,
                jv.title as job_title, jv.job_type, jv.location, c.name as company_name, c.logo as company_logo
                FROM job_applications ja
                LEFT JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id
                LEFT JOIN companies c ON jv.company_id = c.id
                WHERE ja.applicant_id = $1`

	dataArgs := []interface{}{applicantId}

	if status != "" {
		dataSQL += ` AND ja.status = $` + fmt.Sprintf("%d", len(dataArgs)+1)
		dataArgs = append(dataArgs, status)
	}

	dataSQL += ` ORDER BY ja.submitted_at DESC LIMIT $` + fmt.Sprintf("%d", len(dataArgs)+1) +
		` OFFSET $` + fmt.Sprintf("%d", len(dataArgs)+2)
	dataArgs = append(dataArgs, limit, offset)

	rows, err := tx.QueryContext(ctx, dataSQL, dataArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var applications []domain.JobApplication
	for rows.Next() {
		var app domain.JobApplication
		var jobVacancy domain.JobVacancy
		var company domain.Company
		var companyLogo sql.NullString
		var motivationLetter, coverLetter sql.NullString
		var expectedSalary sql.NullFloat64
		var availableStartDate sql.NullTime
		var rejectionReason, notes sql.NullString

		err := rows.Scan(
			&app.Id, &app.JobVacancyId, &app.ApplicantId, &app.CvFilePath, &app.ContactInfo,
			&motivationLetter, &coverLetter, &expectedSalary, &availableStartDate,
			&app.Status, &rejectionReason, &notes, &app.ReviewedBy, &app.ReviewedAt,
			&app.InterviewScheduledAt, &app.SubmittedAt, &app.CreatedAt, &app.UpdatedAt,
			&jobVacancy.Title, &jobVacancy.JobType, &jobVacancy.Location, &company.Name, &companyLogo)

		if err != nil {
			return nil, 0, err
		}

		// Handle nullable fields
		if motivationLetter.Valid {
			app.MotivationLetter = &motivationLetter.String
		}
		if coverLetter.Valid {
			app.CoverLetter = &coverLetter.String
		}
		if expectedSalary.Valid {
			app.ExpectedSalary = &expectedSalary.Float64
		}
		if availableStartDate.Valid {
			app.AvailableStartDate = &availableStartDate.Time
		}
		if rejectionReason.Valid {
			app.RejectionReason = &rejectionReason.String
		}
		if notes.Valid {
			app.Notes = &notes.String
		}

		// Set relations
		jobVacancy.Id = app.JobVacancyId
		company.Id = jobVacancy.CompanyId
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		jobVacancy.Company = &company
		app.JobVacancy = &jobVacancy

		applications = append(applications, app)
	}

	return applications, total, nil
}

func (repository *JobApplicationRepositoryImpl) FindByCompanyId(ctx context.Context, tx *sql.Tx, companyId uuid.UUID, status string, limit, offset int) ([]domain.JobApplication, int, error) {
	// Count query
	countSQL := `SELECT COUNT(*) FROM job_applications ja 
                 JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id 
                 WHERE jv.company_id = $1`
	args := []interface{}{companyId}

	if status != "" {
		countSQL += ` AND ja.status = $2`
		args = append(args, status)
	}

	var total int
	err := tx.QueryRowContext(ctx, countSQL, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query
	dataSQL := `SELECT ja.id, ja.job_vacancy_id, ja.applicant_id, ja.cv_file_path, ja.contact_info,
                ja.motivation_letter, ja.cover_letter, ja.expected_salary, ja.available_start_date,
                ja.status, ja.rejection_reason, ja.notes, ja.reviewed_by, ja.reviewed_at,
                ja.interview_scheduled_at, ja.submitted_at, ja.created_at, ja.updated_at,
                jv.title as job_title, a.name as applicant_name, a.username as applicant_username, 
                a.photo as applicant_photo, a.email as applicant_email
                FROM job_applications ja
                JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id
                LEFT JOIN users a ON ja.applicant_id = a.id
                WHERE jv.company_id = $1`

	dataArgs := []interface{}{companyId}

	if status != "" {
		dataSQL += ` AND ja.status = $` + fmt.Sprintf("%d", len(dataArgs)+1)
		dataArgs = append(dataArgs, status)
	}

	dataSQL += ` ORDER BY ja.submitted_at DESC LIMIT $` + fmt.Sprintf("%d", len(dataArgs)+1) +
		` OFFSET $` + fmt.Sprintf("%d", len(dataArgs)+2)
	dataArgs = append(dataArgs, limit, offset)

	rows, err := tx.QueryContext(ctx, dataSQL, dataArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var applications []domain.JobApplication
	for rows.Next() {
		var app domain.JobApplication
		var jobVacancy domain.JobVacancy
		var applicant domain.User
		var applicantPhoto sql.NullString
		var motivationLetter, coverLetter sql.NullString
		var expectedSalary sql.NullFloat64
		var availableStartDate sql.NullTime
		var rejectionReason, notes sql.NullString

		err := rows.Scan(
			&app.Id, &app.JobVacancyId, &app.ApplicantId, &app.CvFilePath, &app.ContactInfo,
			&motivationLetter, &coverLetter, &expectedSalary, &availableStartDate,
			&app.Status, &rejectionReason, &notes, &app.ReviewedBy, &app.ReviewedAt,
			&app.InterviewScheduledAt, &app.SubmittedAt, &app.CreatedAt, &app.UpdatedAt,
			&jobVacancy.Title, &applicant.Name, &applicant.Username, &applicantPhoto, &applicant.Email)

		if err != nil {
			return nil, 0, err
		}

		// Handle nullable fields
		if motivationLetter.Valid {
			app.MotivationLetter = &motivationLetter.String
		}
		if coverLetter.Valid {
			app.CoverLetter = &coverLetter.String
		}
		if expectedSalary.Valid {
			app.ExpectedSalary = &expectedSalary.Float64
		}
		if availableStartDate.Valid {
			app.AvailableStartDate = &availableStartDate.Time
		}
		if rejectionReason.Valid {
			app.RejectionReason = &rejectionReason.String
		}
		if notes.Valid {
			app.Notes = &notes.String
		}

		// Set relations
		jobVacancy.Id = app.JobVacancyId
		app.JobVacancy = &jobVacancy

		applicant.Id = app.ApplicantId
		if applicantPhoto.Valid {
			applicant.Photo = applicantPhoto.String
		}
		app.Applicant = &applicant

		applications = append(applications, app)
	}

	return applications, total, nil
}

func (repository *JobApplicationRepositoryImpl) FindWithFilters(ctx context.Context, tx *sql.Tx, jobVacancyId, applicantId, reviewedBy, companyId *uuid.UUID, status, search string, limit, offset int) ([]domain.JobApplication, int, error) {
	// Build WHERE clause
	var whereConditions []string
	var args []interface{}
	argCount := 0

	if jobVacancyId != nil {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("ja.job_vacancy_id = $%d", argCount))
		args = append(args, *jobVacancyId)
	}

	if applicantId != nil {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("ja.applicant_id = $%d", argCount))
		args = append(args, *applicantId)
	}

	if reviewedBy != nil {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("ja.reviewed_by = $%d", argCount))
		args = append(args, *reviewedBy)
	}

	if companyId != nil {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("jv.company_id = $%d", argCount))
		args = append(args, *companyId)
	}

	if status != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("ja.status = $%d", argCount))
		args = append(args, status)
	}

	if search != "" {
		argCount++
		whereConditions = append(whereConditions, fmt.Sprintf("(a.name ILIKE $%d OR jv.title ILIKE $%d)", argCount, argCount))
		args = append(args, "%"+search+"%")
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = "WHERE " + strings.Join(whereConditions, " AND ")
	}

	// Count query
	countSQL := fmt.Sprintf(`SELECT COUNT(*) FROM job_applications ja
                            LEFT JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id
                            LEFT JOIN users a ON ja.applicant_id = a.id
                            %s`, whereClause)

	var total int
	err := tx.QueryRowContext(ctx, countSQL, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data query
	dataSQL := fmt.Sprintf(`SELECT ja.id, ja.job_vacancy_id, ja.applicant_id, ja.cv_file_path, ja.contact_info,
                            ja.motivation_letter, ja.cover_letter, ja.expected_salary, ja.available_start_date,
                            ja.status, ja.rejection_reason, ja.notes, ja.reviewed_by, ja.reviewed_at,
                            ja.interview_scheduled_at, ja.submitted_at, ja.created_at, ja.updated_at,
                            jv.title, jv.job_type, jv.location, c.name as company_name, c.logo as company_logo,
                            a.name as applicant_name, a.username as applicant_username, a.photo as applicant_photo, a.email as applicant_email
                            FROM job_applications ja
                            LEFT JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id
                            LEFT JOIN companies c ON jv.company_id = c.id
                            LEFT JOIN users a ON ja.applicant_id = a.id
                            %s
                            ORDER BY ja.submitted_at DESC
                            LIMIT $%d OFFSET $%d`, whereClause, argCount+1, argCount+2)

	args = append(args, limit, offset)

	rows, err := tx.QueryContext(ctx, dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var applications []domain.JobApplication
	for rows.Next() {
		var app domain.JobApplication
		var jobVacancy domain.JobVacancy
		var company domain.Company
		var applicant domain.User
		var companyLogo, applicantPhoto sql.NullString
		var motivationLetter, coverLetter sql.NullString
		var expectedSalary sql.NullFloat64
		var availableStartDate sql.NullTime
		var rejectionReason, notes sql.NullString

		err := rows.Scan(
			&app.Id, &app.JobVacancyId, &app.ApplicantId, &app.CvFilePath, &app.ContactInfo,
			&motivationLetter, &coverLetter, &expectedSalary, &availableStartDate,
			&app.Status, &rejectionReason, &notes, &app.ReviewedBy, &app.ReviewedAt,
			&app.InterviewScheduledAt, &app.SubmittedAt, &app.CreatedAt, &app.UpdatedAt,
			&jobVacancy.Title, &jobVacancy.JobType, &jobVacancy.Location, &company.Name, &companyLogo,
			&applicant.Name, &applicant.Username, &applicantPhoto, &applicant.Email)

		if err != nil {
			return nil, 0, err
		}

		// Handle nullable fields
		if motivationLetter.Valid {
			app.MotivationLetter = &motivationLetter.String
		}
		if coverLetter.Valid {
			app.CoverLetter = &coverLetter.String
		}
		if expectedSalary.Valid {
			app.ExpectedSalary = &expectedSalary.Float64
		}
		if availableStartDate.Valid {
			app.AvailableStartDate = &availableStartDate.Time
		}
		if rejectionReason.Valid {
			app.RejectionReason = &rejectionReason.String
		}
		if notes.Valid {
			app.Notes = &notes.String
		}

		// Set relations
		jobVacancy.Id = app.JobVacancyId
		company.Id = jobVacancy.CompanyId
		if companyLogo.Valid {
			company.Logo = companyLogo.String
		}
		jobVacancy.Company = &company
		app.JobVacancy = &jobVacancy

		applicant.Id = app.ApplicantId
		if applicantPhoto.Valid {
			applicant.Photo = applicantPhoto.String
		}
		app.Applicant = &applicant

		applications = append(applications, app)
	}

	return applications, total, nil
}

func (repository *JobApplicationRepositoryImpl) HasApplied(ctx context.Context, tx *sql.Tx, jobVacancyId, applicantId uuid.UUID) bool {
	SQL := `SELECT EXISTS(SELECT 1 FROM job_applications WHERE job_vacancy_id = $1 AND applicant_id = $2)`

	var exists bool
	err := tx.QueryRowContext(ctx, SQL, jobVacancyId, applicantId).Scan(&exists)
	if err != nil {
		return false
	}

	return exists
}

func (repository *JobApplicationRepositoryImpl) CountByJobVacancyId(ctx context.Context, tx *sql.Tx, jobVacancyId uuid.UUID) (int, error) {
	SQL := `SELECT COUNT(*) FROM job_applications WHERE job_vacancy_id = $1`

	var count int
	err := tx.QueryRowContext(ctx, SQL, jobVacancyId).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (repository *JobApplicationRepositoryImpl) CountByStatus(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID, status domain.JobApplicationStatus) (int, error) {
	var SQL string
	var args []interface{}

	if companyId != nil {
		SQL = `SELECT COUNT(*) FROM job_applications ja 
               JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id 
               WHERE jv.company_id = $1 AND ja.status = $2`
		args = []interface{}{*companyId, status}
	} else {
		SQL = `SELECT COUNT(*) FROM job_applications WHERE status = $1`
		args = []interface{}{status}
	}

	var count int
	err := tx.QueryRowContext(ctx, SQL, args...).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (repository *JobApplicationRepositoryImpl) GetStats(ctx context.Context, tx *sql.Tx, companyId *uuid.UUID) (map[string]int, error) {
	var SQL string
	var args []interface{}

	if companyId != nil {
		SQL = `SELECT status, COUNT(*) as count FROM job_applications ja 
               JOIN job_vacancies jv ON ja.job_vacancy_id = jv.id 
               WHERE jv.company_id = $1 
               GROUP BY status`
		args = []interface{}{*companyId}
	} else {
		SQL = `SELECT status, COUNT(*) as count FROM job_applications GROUP BY status`
	}

	rows, err := tx.QueryContext(ctx, SQL, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stats := make(map[string]int)
	total := 0

	for rows.Next() {
		var status string
		var count int
		err := rows.Scan(&status, &count)
		if err != nil {
			return nil, err
		}
		stats[status] = count
		total += count
	}

	stats["total"] = total
	return stats, nil
}
