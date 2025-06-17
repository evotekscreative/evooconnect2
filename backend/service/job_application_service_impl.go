package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type JobApplicationServiceImpl struct {
	JobApplicationRepository repository.JobApplicationRepository
	JobVacancyRepository     repository.JobVacancyRepository
	CompanyRepository        repository.CompanyRepository
	MemberCompanyRepository  repository.MemberCompanyRepository
	UserRepository           repository.UserRepository
	DB                       *sql.DB
	Validate                 *validator.Validate
}

func NewJobApplicationService(
	jobApplicationRepository repository.JobApplicationRepository,
	jobVacancyRepository repository.JobVacancyRepository,
	companyRepository repository.CompanyRepository,
	memberCompanyRepository repository.MemberCompanyRepository,
	userRepository repository.UserRepository,
	DB *sql.DB,
	validate *validator.Validate,
) JobApplicationService {
	return &JobApplicationServiceImpl{
		JobApplicationRepository: jobApplicationRepository,
		JobVacancyRepository:     jobVacancyRepository,
		CompanyRepository:        companyRepository,
		MemberCompanyRepository:  memberCompanyRepository,
		UserRepository:           userRepository,
		DB:                       DB,
		Validate:                 validate,
	}
}

func (service *JobApplicationServiceImpl) Create(ctx context.Context, request web.CreateJobApplicationRequest, jobVacancyId uuid.UUID, applicantId uuid.UUID) web.JobApplicationResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job vacancy exists and is published
	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	if jobVacancy.Status != domain.JobVacancyStatusActive {
		panic(exception.NewBadRequestError("Job vacancy is not available for applications"))
	}

	// Check if application deadline has passed
	if jobVacancy.ApplicationDeadline != nil && time.Now().After(*jobVacancy.ApplicationDeadline) {
		panic(exception.NewBadRequestError("Application deadline has passed"))
	}

	// Check if user has already applied
	hasApplied := service.JobApplicationRepository.HasApplied(ctx, tx, jobVacancyId, applicantId)
	if hasApplied {
		panic(exception.NewBadRequestError("You have already applied for this job"))
	}

	// Check if user is a member of the company
	isMember, err := service.MemberCompanyRepository.IsUserMemberOfCompany(ctx, tx, applicantId, jobVacancy.CompanyId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to check company membership"))
	}
	if isMember {
		panic(exception.NewBadRequestError("You cannot apply to a job at your own company"))
	}

	// Get CV file path if provided
	// var cvFilePath *string

	// Create job application
	jobApplication := domain.JobApplication{
		Id:                 uuid.New(),
		JobVacancyId:       jobVacancyId,
		ApplicantId:        applicantId,
		ContactInfo:        domain.ContactInfo(request.ContactInfo),
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

	// Get created application with relations
	result, err := service.JobApplicationRepository.FindById(ctx, tx, jobApplication.Id)
	helper.PanicIfError(err)

	return helper.ToJobApplicationResponse(result)
}

func (service *JobApplicationServiceImpl) Update(ctx context.Context, request web.UpdateJobApplicationRequest, applicationId uuid.UUID, applicantId uuid.UUID) web.JobApplicationResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing application
	existingApplication, err := service.JobApplicationRepository.FindById(ctx, tx, applicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	// Check ownership
	if existingApplication.ApplicantId != applicantId {
		panic(exception.NewForbiddenError("You can only update your own applications"))
	}

	// Check if application can be updated (only submitted status)
	if existingApplication.Status != domain.ApplicationStatusSubmitted {
		panic(exception.NewBadRequestError("Application cannot be updated after review has started"))
	}

	// Update application
	existingApplication.ContactInfo = domain.ContactInfo(request.ContactInfo)
	existingApplication.MotivationLetter = request.MotivationLetter
	existingApplication.CoverLetter = request.CoverLetter
	existingApplication.ExpectedSalary = request.ExpectedSalary
	existingApplication.AvailableStartDate = request.AvailableStartDate
	existingApplication.UpdatedAt = time.Now()

	updatedApplication := service.JobApplicationRepository.Update(ctx, tx, existingApplication)

	// Get updated application with relations
	result, err := service.JobApplicationRepository.FindById(ctx, tx, updatedApplication.Id)
	helper.PanicIfError(err)

	return helper.ToJobApplicationResponse(result)
}

func (service *JobApplicationServiceImpl) Delete(ctx context.Context, applicationId uuid.UUID, applicantId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing application
	existingApplication, err := service.JobApplicationRepository.FindById(ctx, tx, applicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	// Check ownership
	if existingApplication.ApplicantId != applicantId {
		panic(exception.NewForbiddenError("You can only delete your own applications"))
	}

	// Check if application can be deleted (only submitted status)
	if existingApplication.Status != domain.ApplicationStatusSubmitted {
		panic(exception.NewBadRequestError("Application cannot be deleted after review has started"))
	}

	err = service.JobApplicationRepository.Delete(ctx, tx, applicationId)
	helper.PanicIfError(err)
}

func (service *JobApplicationServiceImpl) FindById(ctx context.Context, applicationId uuid.UUID) web.JobApplicationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobApplication, err := service.JobApplicationRepository.FindById(ctx, tx, applicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	return helper.ToJobApplicationResponse(jobApplication)
}

func (service *JobApplicationServiceImpl) FindByJobVacancy(ctx context.Context, jobVacancyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Validate job vacancy exists
	_, err = service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	applications, total, err := service.JobApplicationRepository.FindByJobVacancyId(ctx, tx, jobVacancyId, status, limit, offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: helper.ToJobApplicationResponses(applications),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobApplicationServiceImpl) FindByApplicant(ctx context.Context, applicantId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	applications, total, err := service.JobApplicationRepository.FindByApplicantId(ctx, tx, applicantId, status, limit, offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: helper.ToJobApplicationResponses(applications),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobApplicationServiceImpl) FindByCompany(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) web.JobApplicationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	applications, total, err := service.JobApplicationRepository.FindByCompanyId(ctx, tx, companyId, status, limit, offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: helper.ToJobApplicationResponses(applications),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobApplicationServiceImpl) FindWithFilters(ctx context.Context, request web.JobApplicationFilterRequest) web.JobApplicationListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	applications, total, err := service.JobApplicationRepository.FindWithFilters(
		ctx, tx, request.JobVacancyId, request.ApplicantId, request.ReviewedBy,
		request.CompanyId, request.Status, request.Search, request.Limit, request.Offset)
	helper.PanicIfError(err)

	return web.JobApplicationListResponse{
		Applications: helper.ToJobApplicationResponses(applications),
		Total:        total,
		Limit:        request.Limit,
		Offset:       request.Offset,
	}
}

func (service *JobApplicationServiceImpl) ReviewApplication(ctx context.Context, request web.ReviewJobApplicationRequest, applicationId uuid.UUID, reviewerId uuid.UUID) web.JobApplicationResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing application
	existingApplication, err := service.JobApplicationRepository.FindById(ctx, tx, applicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	// Update application status and review info
	existingApplication.Status = domain.JobApplicationStatus(request.Status)
	existingApplication.RejectionReason = request.RejectionReason
	existingApplication.Notes = request.Notes
	existingApplication.ReviewedBy = &reviewerId
	now := time.Now()
	existingApplication.ReviewedAt = &now
	existingApplication.UpdatedAt = now

	updatedApplication := service.JobApplicationRepository.Update(ctx, tx, existingApplication)

	// Get updated application with relations
	result, err := service.JobApplicationRepository.FindById(ctx, tx, updatedApplication.Id)
	helper.PanicIfError(err)

	return helper.ToJobApplicationResponse(result)
}

func (service *JobApplicationServiceImpl) UploadCV(ctx context.Context, applicationId uuid.UUID, applicantId uuid.UUID, filePath string) web.JobApplicationResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing application
	existingApplication, err := service.JobApplicationRepository.FindById(ctx, tx, applicationId)
	if err != nil {
		panic(exception.NewNotFoundError("Job application not found"))
	}

	// Check ownership
	if existingApplication.ApplicantId != applicantId {
		panic(exception.NewForbiddenError("You can only upload CV for your own applications"))
	}

	// Update CV file path
	existingApplication.CvFilePath = filePath
	existingApplication.UpdatedAt = time.Now()

	updatedApplication := service.JobApplicationRepository.Update(ctx, tx, existingApplication)

	// Get updated application with relations
	result, err := service.JobApplicationRepository.FindById(ctx, tx, updatedApplication.Id)
	helper.PanicIfError(err)

	return helper.ToJobApplicationResponse(result)
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
	}
}

func (service *JobApplicationServiceImpl) HasApplied(ctx context.Context, jobVacancyId, applicantId uuid.UUID) bool {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	return service.JobApplicationRepository.HasApplied(ctx, tx, jobVacancyId, applicantId)
}
