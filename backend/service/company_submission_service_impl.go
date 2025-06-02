package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"log"
	"mime/multipart"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CompanySubmissionServiceImpl struct {
	CompanySubmissionRepository repository.CompanySubmissionRepository
	CompanyRepository           repository.CompanyRepository
	UserRepository              repository.UserRepository
	AdminRepository             repository.AdminRepository
	NotificationService         NotificationService
	DB                          *sql.DB
	Validate                    *validator.Validate
}

func NewCompanySubmissionService(
	companySubmissionRepository repository.CompanySubmissionRepository,
	companyRepository repository.CompanyRepository,
	userRepository repository.UserRepository,
	adminRepository repository.AdminRepository,
	notificationService NotificationService,
	db *sql.DB,
	validate *validator.Validate) CompanySubmissionService {
	return &CompanySubmissionServiceImpl{
		CompanySubmissionRepository: companySubmissionRepository,
		CompanyRepository:           companyRepository,
		UserRepository:              userRepository,
		AdminRepository:             adminRepository,
		NotificationService:         notificationService,
		DB:                          db,
		Validate:                    validate,
	}
}

func (service *CompanySubmissionServiceImpl) Create(ctx context.Context, userId uuid.UUID, request web.CreateCompanySubmissionRequest, logoFile *multipart.FileHeader) web.CompanySubmissionResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user has pending submission
	hasPending := service.CompanySubmissionRepository.HasPendingSubmission(ctx, tx, userId)
	if hasPending {
		panic(exception.NewBadRequestError("You already have a pending company submission"))
	}

	// Check if user exists
	_, err = service.UserRepository.FindById(ctx, tx, userId)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Upload logo if provided
	var logoPath string
	if logoFile != nil {
		file, err := logoFile.Open()
		helper.PanicIfError(err)
		defer file.Close()

		uploadResult, err := helper.UploadImage(file, logoFile, helper.DirGroups, userId.String(), "logo")
		helper.PanicIfError(err)
		logoPath = uploadResult.RelativePath
	}

	// Create submission
	submission := domain.CompanySubmission{
		Id:          uuid.New(),
		UserId:      userId,
		Name:        request.Name,
		LinkedinUrl: request.LinkedinUrl,
		Website:     request.Website,
		Industry:    request.Industry,
		Size:        request.Size,
		Type:        request.Type,
		Logo:        logoPath,
		Tagline:     request.Tagline,
		Status:      domain.CompanySubmissionStatusPending,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	submission = service.CompanySubmissionRepository.Create(ctx, tx, submission)

	// Send notification to user
	if service.NotificationService != nil {
		go func() {
			refType := "company_submission_created"
			service.NotificationService.Create(
				context.Background(),
				userId,
				string(domain.NotificationCategoryCompany),
				"company_submission_created",
				"Company Submission Created",
				"Your company submission has been created and is now under review",
				&submission.Id,
				&refType,
				nil,
			)
		}()
	}

	return helper.ToCompanySubmissionResponse(submission)
}

func (service *CompanySubmissionServiceImpl) FindById(ctx context.Context, id uuid.UUID) web.CompanySubmissionResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	submission, err := service.CompanySubmissionRepository.FindById(ctx, tx, id)
	if err != nil {
		panic(exception.NewNotFoundError("Company submission not found"))
	}

	return helper.ToCompanySubmissionResponse(submission)
}

func (service *CompanySubmissionServiceImpl) FindByUserId(ctx context.Context, userId uuid.UUID) []web.CompanySubmissionResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	submissions, err := service.CompanySubmissionRepository.FindByUserId(ctx, tx, userId)
	if err != nil {
		return []web.CompanySubmissionResponse{}
	}

	var responses []web.CompanySubmissionResponse
	for _, submission := range submissions {
		responses = append(responses, helper.ToCompanySubmissionResponse(submission))
	}

	return responses
}

func (service *CompanySubmissionServiceImpl) FindAll(ctx context.Context, limit, offset int) []web.CompanySubmissionResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	submissions := service.CompanySubmissionRepository.FindAll(ctx, tx, limit, offset)

	var responses []web.CompanySubmissionResponse
	for _, submission := range submissions {
		responses = append(responses, helper.ToCompanySubmissionResponse(submission))
	}

	return responses
}

func (service *CompanySubmissionServiceImpl) FindByStatus(ctx context.Context, status string, limit, offset int) []web.CompanySubmissionResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	submissionStatus := domain.CompanySubmissionStatus(status)
	submissions := service.CompanySubmissionRepository.FindByStatus(ctx, tx, submissionStatus, limit, offset)

	var responses []web.CompanySubmissionResponse
	for _, submission := range submissions {
		responses = append(responses, helper.ToCompanySubmissionResponse(submission))
	}

	return responses
}

func (service *CompanySubmissionServiceImpl) Review(ctx context.Context, submissionId uuid.UUID, reviewerId uuid.UUID, request web.ReviewCompanySubmissionRequest) web.CompanySubmissionResponse {
	log.Printf("Starting review process for submission %s by reviewer %s", submissionId, reviewerId)

	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	log.Printf("Finding submission with ID: %s", submissionId)
	// Find submission
	submission, err := service.CompanySubmissionRepository.FindById(ctx, tx, submissionId)
	if err != nil {
		log.Printf("Submission not found: %v", err)
		panic(exception.NewNotFoundError("Company submission not found"))
	}
	log.Printf("Submission found: %s", submission.Name)

	// Check if already reviewed
	if submission.Status != domain.CompanySubmissionStatusPending {
		panic(exception.NewBadRequestError("Company submission has already been reviewed"))
	}

	log.Printf("Finding admin reviewer with ID: %s", reviewerId)
	// Check if admin reviewer exists
	_, err = service.AdminRepository.FindById(ctx, tx, reviewerId)
	if err != nil {
		log.Printf("Admin reviewer not found: %v", err)
		panic(exception.NewNotFoundError("Admin reviewer not found"))
	}
	log.Printf("Admin reviewer found")

	// Update submission
	now := time.Now()
	submission.Status = domain.CompanySubmissionStatus(request.Status)
	submission.RejectionReason = request.RejectionReason
	submission.ReviewedBy = &reviewerId
	submission.ReviewedAt = &now
	submission.UpdatedAt = now

	log.Printf("Updating submission status to: %s", request.Status)
	submission = service.CompanySubmissionRepository.Update(ctx, tx, submission)

	// If approved, create company and update user role
	if submission.Status == domain.CompanySubmissionStatusApproved {
		log.Printf("Creating company for approved submission")
		// Create company
		company := domain.Company{
			Id:          uuid.New(),
			OwnerId:     submission.UserId,
			Name:        submission.Name,
			LinkedinUrl: submission.LinkedinUrl,
			Website:     submission.Website,
			Industry:    submission.Industry,
			Size:        submission.Size,
			Type:        submission.Type,
			Logo:        submission.Logo,
			Tagline:     submission.Tagline,
			IsVerified:  true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		service.CompanyRepository.Create(ctx, tx, company)
		log.Printf("Company created successfully")
	}

	// Send notification to user
	if service.NotificationService != nil {
		go func() {
			var title, message string
			refType := "company_submission_reviewed"

			if submission.Status == domain.CompanySubmissionStatusApproved {
				title = "Company Submission Approved"
				message = fmt.Sprintf("Congratulations! Your company submission for '%s' has been approved", submission.Name)
			} else {
				title = "Company Submission Rejected"
				message = fmt.Sprintf("Your company submission for '%s' has been rejected. Reason: %s", submission.Name, submission.RejectionReason)
			}

			// Fix: Jangan kirim reviewerId sebagai actor_id karena itu admin ID, bukan user ID
			// Kirim nil untuk actor_id atau buat sistem admin notification terpisah
			service.NotificationService.Create(
				context.Background(),
				submission.UserId,
				string(domain.NotificationCategoryCompany),
				"company_submission_reviewed",
				title,
				message,
				&submission.Id,
				&refType,
				nil, // Set actor_id ke nil karena admin bukan user
			)
		}()
	}

	log.Printf("Review process completed successfully")
	return helper.ToCompanySubmissionResponse(submission)
}

func (service *CompanySubmissionServiceImpl) GetSubmissionStats(ctx context.Context) map[string]int {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	stats := make(map[string]int)
	stats["pending"] = service.CompanySubmissionRepository.CountByStatus(ctx, tx, domain.CompanySubmissionStatusPending)
	stats["approved"] = service.CompanySubmissionRepository.CountByStatus(ctx, tx, domain.CompanySubmissionStatusApproved)
	stats["rejected"] = service.CompanySubmissionRepository.CountByStatus(ctx, tx, domain.CompanySubmissionStatusRejected)
	stats["total"] = stats["pending"] + stats["approved"] + stats["rejected"]

	return stats
}
