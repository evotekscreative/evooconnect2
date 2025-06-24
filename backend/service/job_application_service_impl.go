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
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type JobApplicationServiceImpl struct {
	JobApplicationRepository  repository.JobApplicationRepository
	UserCvStorageRepository   repository.UserCvStorageRepository
	JobVacancyRepository      repository.JobVacancyRepository
	UserRepository            repository.UserRepository
	MemberCompanyReRepository repository.MemberCompanyRepository
	DB                        *sql.DB
	Validate                  *validator.Validate
}

func NewJobApplicationService(
	jobApplicationRepository repository.JobApplicationRepository,
	userCvStorageRepository repository.UserCvStorageRepository,
	jobVacancyRepository repository.JobVacancyRepository,
	userRepository repository.UserRepository,
	memberCompanyRepository repository.MemberCompanyRepository,
	DB *sql.DB,
	validate *validator.Validate) JobApplicationService {
	return &JobApplicationServiceImpl{
		JobApplicationRepository:  jobApplicationRepository,
		UserCvStorageRepository:   userCvStorageRepository,
		JobVacancyRepository:      jobVacancyRepository,
		UserRepository:            userRepository,
		MemberCompanyReRepository: memberCompanyRepository,
		DB:                        DB,
		Validate:                  validate,
	}
}

func (service *JobApplicationServiceImpl) Create(ctx context.Context, request web.CreateJobApplicationRequest, jobVacancyId, applicantId uuid.UUID) web.JobApplicationResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job vacancy exists and is active
	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError(fmt.Sprintf("Job vacancy not found: %v", err)))
	}

	// Check External Apply Type
	if jobVacancy.TypeApply == domain.JobApplyTypeExternal {
		// For external applications, return error
		panic(exception.NewBadRequestError("This job vacancy requires external application. Please apply through the external link provided."))
	}

	_, err = service.MemberCompanyReRepository.IsUserMemberOfCompany(ctx, tx, jobVacancy.CompanyId, applicantId)
	if err != nil {
		panic(exception.NewForbiddenError("You are not authorized to apply for this job"))
	}

	if jobVacancy.Status != domain.JobVacancyStatusActive {
		panic(exception.NewBadRequestError("Job vacancy is no longer active"))
	}

	// Check if user already applied
	hasApplied := service.JobApplicationRepository.HasApplied(ctx, tx, jobVacancyId, applicantId)
	if hasApplied {
		panic(exception.NewBadRequestError("You have already applied to this job"))
	}

	// if applicant.Role != "job_seeker" {
	// 	panic(exception.NewForbiddenError("Only job seekers can apply for jobs"))
	// }

	// Handle CV management
	var cvPath string

	if request.CvFile != nil {
		// Upload new CV
		cvPath = service.handleCvUpload(ctx, tx, request.CvFile, applicantId)
	} else if request.ExistingCvPath != nil && *request.ExistingCvPath != "" {
		// Use existing CV
		userCv, err := service.UserCvStorageRepository.FindByUserId(ctx, tx, applicantId)
		if err != nil {
			panic(exception.NewBadRequestError("No existing CV found. Please upload a CV"))
		}
		cvPath = userCv.CvFilePath
	} else {
		panic(exception.NewBadRequestError("CV is required. Please upload a CV or use existing one"))
	}

	// Create contact info domain object
	contactInfo := domain.ContactInfo{
		Phone:    request.ContactInfo.Phone,
		Email:    request.ContactInfo.Email,
		Address:  request.ContactInfo.Address,
		LinkedIn: request.ContactInfo.LinkedIn,
	}

	// Create job application
	jobApplication := domain.JobApplication{
		Id:                 uuid.New(),
		JobVacancyId:       jobVacancyId,
		ApplicantId:        applicantId,
		CvFilePath:         cvPath,
		ContactInfo:        contactInfo,
		MotivationLetter:   request.MotivationLetter,
		CoverLetter:        request.CoverLetter,
		ExpectedSalary:     request.ExpectedSalary,
		AvailableStartDate: request.AvailableStartDate,
		Status:             domain.ApplicationStatusSubmitted,
		SubmittedAt:        time.Now(),
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	jobApplication = service.JobApplicationRepository.Create(ctx, tx, jobApplication)

	// Load relations for response
	jobApplication, err = service.JobApplicationRepository.FindById(ctx, tx, jobApplication.Id)
	helper.PanicIfError(err)

	return service.toJobApplicationResponse(jobApplication)
}

func (service *JobApplicationServiceImpl) Update(ctx context.Context, request web.UpdateJobApplicationRequest, jobApplicationId, applicantId uuid.UUID) web.JobApplicationResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing application
	jobApplication, err := service.JobApplicationRepository.FindById(ctx, tx, jobApplicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	// Verify ownership
	if jobApplication.ApplicantId != applicantId {
		panic(exception.NewForbiddenError("You can only update your own applications"))
	}

	// Check if application can be updated (only submitted status)
	if jobApplication.Status != domain.ApplicationStatusSubmitted {
		panic(exception.NewBadRequestError("Cannot update application that is already being reviewed"))
	}

	// Handle CV update
	var cvPath string = jobApplication.CvFilePath // Keep existing by default

	if request.CvFile != nil {
		// Upload new CV and replace old one
		cvPath = service.handleCvUpload(ctx, tx, request.CvFile, applicantId)
	} else if request.ExistingCvPath != nil && *request.ExistingCvPath != "" {
		// Use existing CV path
		userCv, err := service.UserCvStorageRepository.FindByUserId(ctx, tx, applicantId)
		if err != nil {
			panic(exception.NewBadRequestError("No existing CV found"))
		}
		cvPath = userCv.CvFilePath
	}

	// Update contact info
	contactInfo := domain.ContactInfo{
		Phone:    request.ContactInfo.Phone,
		Email:    request.ContactInfo.Email,
		Address:  request.ContactInfo.Address,
		LinkedIn: request.ContactInfo.LinkedIn,
	}

	// Update job application
	jobApplication.CvFilePath = cvPath
	jobApplication.ContactInfo = contactInfo
	jobApplication.MotivationLetter = request.MotivationLetter
	jobApplication.CoverLetter = request.CoverLetter
	jobApplication.ExpectedSalary = request.ExpectedSalary
	jobApplication.AvailableStartDate = request.AvailableStartDate
	jobApplication.UpdatedAt = time.Now()

	jobApplication = service.JobApplicationRepository.Update(ctx, tx, jobApplication)

	// Reload with relations
	jobApplication, err = service.JobApplicationRepository.FindById(ctx, tx, jobApplication.Id)
	helper.PanicIfError(err)

	return service.toJobApplicationResponse(jobApplication)
}

func (service *JobApplicationServiceImpl) Delete(ctx context.Context, jobApplicationId, applicantId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing application
	jobApplication, err := service.JobApplicationRepository.FindById(ctx, tx, jobApplicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	// Verify ownership
	if jobApplication.ApplicantId != applicantId {
		panic(exception.NewForbiddenError("You can only delete your own applications"))
	}

	// Check if application can be deleted (only submitted status)
	if jobApplication.Status != domain.ApplicationStatusSubmitted {
		panic(exception.NewBadRequestError("Cannot delete application that is already being reviewed"))
	}

	err = service.JobApplicationRepository.Delete(ctx, tx, jobApplicationId)
	helper.PanicIfError(err)
}

func (service *JobApplicationServiceImpl) FindById(ctx context.Context, jobApplicationId uuid.UUID) web.JobApplicationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobApplication, err := service.JobApplicationRepository.FindById(ctx, tx, jobApplicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	return service.toJobApplicationResponse(jobApplication)
}

func (service *JobApplicationServiceImpl) FindByJobVacancyId(ctx context.Context, jobVacancyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	applications, total, err := service.JobApplicationRepository.FindByJobVacancyId(ctx, tx, jobVacancyId, status, limit, offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: service.toJobApplicationResponses(applications),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobApplicationServiceImpl) FindByApplicantId(ctx context.Context, applicantId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	applications, total, err := service.JobApplicationRepository.FindByApplicantId(ctx, tx, applicantId, status, limit, offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: service.toJobApplicationResponses(applications),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobApplicationServiceImpl) FindByCompanyId(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	applications, total, err := service.JobApplicationRepository.FindByCompanyId(ctx, tx, companyId, status, limit, offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: service.toJobApplicationResponses(applications),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobApplicationServiceImpl) FindWithFilters(ctx context.Context, request web.JobApplicationFilterRequest) web.JobApplicationListResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	if request.Limit <= 0 {
		request.Limit = 10
	}
	if request.Offset < 0 {
		request.Offset = 0
	}

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	applications, total, err := service.JobApplicationRepository.FindWithFilters(
		ctx, tx, request.JobVacancyId, request.ApplicantId, request.ReviewedBy,
		request.CompanyId, request.Status, request.Search, request.Limit, request.Offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: service.toJobApplicationResponses(applications),
		Total:        total,
		Limit:        request.Limit,
		Offset:       request.Offset,
	}
}

func (service *JobApplicationServiceImpl) ReviewApplication(ctx context.Context, request web.ReviewJobApplicationRequest, jobApplicationId, reviewerId uuid.UUID) web.JobApplicationResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing application
	jobApplication, err := service.JobApplicationRepository.FindById(ctx, tx, jobApplicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	companyId := jobApplication.JobVacancy.CompanyId

	_, err = service.MemberCompanyReRepository.IsUserMemberOfCompany(ctx, tx, companyId, reviewerId)
	if err != nil {
		panic(exception.NewForbiddenError("You are not authorized to review this application"))
	}

	// Verify reviewer is from the same company
	reviewer, err := service.MemberCompanyReRepository.FindByUserAndCompany(ctx, tx, reviewerId, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Reviewer not found"))
	}

	if reviewer.Role != "hr" && reviewer.Role != "company_admin" {
		panic(exception.NewForbiddenError("Only HR or company admin can review applications"))
	}

	// Check if reviewer is from the same company as job vacancy
	if jobApplication.JobVacancy != nil {
		if reviewer.CompanyID != jobApplication.JobVacancy.CompanyId {
			panic(exception.NewForbiddenError("You can only review applications for your company"))
		}
	}

	// Update application status
	status := domain.JobApplicationStatus(request.Status)
	now := time.Now()

	jobApplication.Status = status
	jobApplication.ReviewedBy = &reviewerId
	jobApplication.ReviewedAt = &now

	if request.RejectionReason != "" {
		jobApplication.RejectionReason = &request.RejectionReason
	}

	if request.Notes != "" {
		jobApplication.Notes = &request.Notes
	}

	if status == domain.ApplicationStatusInterviewScheduled {
		// You might want to set interview_scheduled_at from request in the future
		jobApplication.InterviewScheduledAt = &now
	}

	jobApplication = service.JobApplicationRepository.Update(ctx, tx, jobApplication)

	// Reload with relations
	jobApplication, err = service.JobApplicationRepository.FindById(ctx, tx, jobApplication.Id)
	helper.PanicIfError(err)

	return service.toJobApplicationResponse(jobApplication)
}

func (service *JobApplicationServiceImpl) GetStats(ctx context.Context, companyId *uuid.UUID) web.JobApplicationStatsResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	stats, err := service.JobApplicationRepository.GetStats(ctx, tx, companyId)
	helper.PanicIfError(err)

	return web.JobApplicationStatsResponse{
		Submitted:          stats["submitted"],
		UnderReview:        stats["under_review"],
		Shortlisted:        stats["shortlisted"],
		InterviewScheduled: stats["interview_scheduled"],
		Accepted:           stats["accepted"],
		Rejected:           stats["rejected"],
		Total:              stats["total"],
	}
}

func (service *JobApplicationServiceImpl) HasApplied(ctx context.Context, jobVacancyId, applicantId uuid.UUID) bool {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	return service.JobApplicationRepository.HasApplied(ctx, tx, jobVacancyId, applicantId)
}

// Helper methods

func (service *JobApplicationServiceImpl) handleCvUpload(ctx context.Context, tx *sql.Tx, file *multipart.FileHeader, userId uuid.UUID) string {
	// Validate file
	if file.Size > 5*1024*1024 { // 5MB limit
		panic(exception.NewBadRequestError("CV file size must be less than 5MB"))
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".pdf" && ext != ".doc" && ext != ".docx" {
		panic(exception.NewBadRequestError("CV must be in PDF, DOC, or DOCX format"))
	}

	// Check if user already has CV
	userHasCv := service.UserCvStorageRepository.ExistsByUserId(ctx, tx, userId)
	var oldCvPath string

	if userHasCv {
		// Get old CV path for deletion
		existingCv, err := service.UserCvStorageRepository.FindByUserId(ctx, tx, userId)
		if err == nil {
			oldCvPath = existingCv.CvFilePath
		}
	}

	// Save file
	src, err := file.Open()
	if err != nil {
		panic(exception.NewBadRequestError("Failed to open uploaded file"))
	}
	defer src.Close()

	filePath := helper.SaveUploadedFile(src, "cv_storage", userId.String(), file.Filename)

	// Update or create CV storage record
	cvStorage := domain.UserCvStorage{
		Id:               uuid.New(),
		UserId:           userId,
		CvFilePath:       filePath,
		OriginalFilename: file.Filename,
		FileSize:         file.Size,
		UploadedAt:       time.Now(),
		UpdatedAt:        time.Now(),
	}

	if userHasCv {
		// Update existing record
		service.UserCvStorageRepository.Update(ctx, tx, cvStorage)

		// Delete old file if exists and different from new one
		if oldCvPath != "" && oldCvPath != filePath {
			go func() {
				os.Remove(oldCvPath)
			}()
		}
	} else {
		// Create new record
		service.UserCvStorageRepository.Create(ctx, tx, cvStorage)
	}

	return filePath
}

func (service *JobApplicationServiceImpl) toJobApplicationResponse(jobApplication domain.JobApplication) web.JobApplicationResponse {
	response := web.JobApplicationResponse{
		Id:                   jobApplication.Id,
		JobVacancyId:         jobApplication.JobVacancyId,
		ApplicantId:          jobApplication.ApplicantId,
		CvFilePath:           jobApplication.CvFilePath,
		ContactInfo:          service.toContactInfoResponse(jobApplication.ContactInfo),
		MotivationLetter:     jobApplication.MotivationLetter,
		CoverLetter:          jobApplication.CoverLetter,
		ExpectedSalary:       jobApplication.ExpectedSalary,
		AvailableStartDate:   jobApplication.AvailableStartDate,
		Status:               string(jobApplication.Status),
		RejectionReason:      jobApplication.RejectionReason,
		Notes:                jobApplication.Notes,
		ReviewedBy:           jobApplication.ReviewedBy,
		ReviewedAt:           jobApplication.ReviewedAt,
		InterviewScheduledAt: jobApplication.InterviewScheduledAt,
		SubmittedAt:          jobApplication.SubmittedAt,
		CreatedAt:            jobApplication.CreatedAt,
		UpdatedAt:            jobApplication.UpdatedAt,
	}

	// Set relations
	if jobApplication.JobVacancy != nil {
		response.JobVacancy = &web.JobVacancyBriefResponse{
			Id:       jobApplication.JobVacancy.Id,
			Title:    jobApplication.JobVacancy.Title,
			JobType:  jobApplication.JobVacancy.JobType,
			Location: jobApplication.JobVacancy.Location,
		}

		if jobApplication.JobVacancy.Company != nil {
			response.JobVacancy.Company = &web.CompanyBriefResponse{
				Id:   jobApplication.JobVacancy.Company.Id,
				Name: jobApplication.JobVacancy.Company.Name,
				Logo: &jobApplication.JobVacancy.Company.Logo,
			}
		}
	}

	if jobApplication.Applicant != nil {
		response.Applicant = &web.UserBriefResponse{
			Id:       jobApplication.Applicant.Id,
			Name:     jobApplication.Applicant.Name,
			Username: jobApplication.Applicant.Username,
			Email:    jobApplication.Applicant.Email,
			Photo:    jobApplication.Applicant.Photo,
		}
	}

	if jobApplication.Reviewer != nil {
		response.Reviewer = &web.UserBriefResponse{
			Id:       jobApplication.Reviewer.Id,
			Name:     jobApplication.Reviewer.Name,
			Username: jobApplication.Reviewer.Username,
		}
	}

	return response
}

func (service *JobApplicationServiceImpl) toJobApplicationResponses(jobApplications []domain.JobApplication) []web.JobApplicationResponse {
	var responses []web.JobApplicationResponse
	for _, jobApplication := range jobApplications {
		responses = append(responses, service.toJobApplicationResponse(jobApplication))
	}
	return responses
}

func (service *JobApplicationServiceImpl) toContactInfoResponse(contactInfo domain.ContactInfo) web.ContactInfoResponse {
	return web.ContactInfoResponse{
		Phone:    contactInfo.Phone,
		Email:    contactInfo.Email,
		Address:  contactInfo.Address,
		LinkedIn: contactInfo.LinkedIn,
	}
}
