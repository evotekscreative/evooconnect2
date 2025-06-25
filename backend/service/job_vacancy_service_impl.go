package service

import (
	"context"
	"database/sql"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"math"
	"time"
	"fmt"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type JobVacancyServiceImpl struct {
	SavedJobRepository        repository.SavedJobRepository
	JobVacancyRepository      repository.JobVacancyRepository
	JobApplicationRepository  repository.JobApplicationRepository
	CompanyRepository         repository.CompanyRepository
	UserRepository            repository.UserRepository
	CompanyFollowerRepository repository.CompanyFollowerRepository // Tambah ini
	NotificationService       NotificationService                  // Tambah ini
	DB                        *sql.DB
	Validate                  *validator.Validate
}

func NewJobVacancyService(
	jobVacancyRepository repository.JobVacancyRepository,
	companyRepository repository.CompanyRepository,
	userRepository repository.UserRepository,
	savedJobRepository repository.SavedJobRepository,
	jobApplicationRepository repository.JobApplicationRepository,
	companyFollowerRepository repository.CompanyFollowerRepository, // Tambah ini
	notificationService NotificationService, // Tambah ini
	db *sql.DB,
	validate *validator.Validate) JobVacancyService {
	return &JobVacancyServiceImpl{
		SavedJobRepository:       savedJobRepository,
		JobVacancyRepository:     jobVacancyRepository,
		JobApplicationRepository: jobApplicationRepository,
		CompanyRepository:        companyRepository,
		UserRepository:           userRepository,
		DB:                       db,
		Validate:                 validate,
	}
}

func (service *JobVacancyServiceImpl) Create(ctx context.Context, request web.CreateJobVacancyRequest, companyId, creatorId uuid.UUID) web.JobVacancyResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Validate type_apply and external_link combination
	if request.TypeApply == "external_apply" && (request.ExternalLink == nil || *request.ExternalLink == "") {
		panic(exception.NewBadRequestError("External link is required when type_apply is external_apply"))
	}

	// Validate salary range
	if request.MinSalary != nil && request.MaxSalary != nil && *request.MinSalary > *request.MaxSalary {
		panic(exception.NewBadRequestError("Minimum salary cannot be greater than maximum salary"))
	}

	// Verify company exists and user has permission
	_, err = service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Parse application deadline if provided
	var applicationDeadline *time.Time
	if request.ApplicationDeadline != nil {
		parsedTime, err := time.Parse("2006-01-02T15:04:05Z", *request.ApplicationDeadline)
		if err != nil {
			panic(exception.NewBadRequestError("Invalid application deadline format. Use: 2006-01-02T15:04:05Z"))
		}
		applicationDeadline = &parsedTime
	}

	// Create job vacancy domain
	jobVacancy := domain.JobVacancy{
		CompanyId:           companyId,
		CreatorId:           &creatorId,
		Title:               request.Title,
		Description:         request.Description,
		Requirements:        request.Requirements,
		Location:            request.Location,
		JobType:             request.JobType,
		ExperienceLevel:     domain.ExperienceLevel(request.ExperienceLevel),
		MinSalary:           request.MinSalary,
		MaxSalary:           request.MaxSalary,
		Currency:            request.Currency,
		Skills:              domain.SkillsArray(request.Skills),
		Benefits:            request.Benefits,
		WorkType:            domain.WorkType(request.WorkType),
		ApplicationDeadline: applicationDeadline,
		Status:              domain.JobVacancyStatusActive,
		TypeApply:           domain.JobApplyType(request.TypeApply),
		ExternalLink:        request.ExternalLink,
	}

	// Create job vacancy
	jobVacancy = service.JobVacancyRepository.Create(ctx, tx, jobVacancy)

	// Fetch complete data with relations
	jobVacancy, err = service.JobVacancyRepository.FindById(ctx, tx, jobVacancy.Id)
	helper.PanicIfError(err)
	service.sendNotificationToCompanyFollowers(jobVacancy, creatorId) // Tambah ini
	return service.toJobVacancyResponse(ctx, tx, jobVacancy, &creatorId)
}

func (service *JobVacancyServiceImpl) Update(ctx context.Context, request web.UpdateJobVacancyRequest, jobVacancyId uuid.UUID, userId uuid.UUID) web.JobVacancyResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Validate type_apply and external_link combination
	if request.TypeApply == "external_apply" && (request.ExternalLink == nil || *request.ExternalLink == "") {
		panic(exception.NewBadRequestError("External link is required when type_apply is external_apply"))
	}

	// Validate salary range
	if request.MinSalary != nil && request.MaxSalary != nil && *request.MinSalary > *request.MaxSalary {
		panic(exception.NewBadRequestError("Minimum salary cannot be greater than maximum salary"))
	}

	// Check if job vacancy exists
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check if user has permission to update (creator or company owner/admin)
	if existingJobVacancy.CreatorId == nil || *existingJobVacancy.CreatorId != userId {
		panic(exception.NewForbiddenError("You don't have permission to update this job vacancy"))
	}

	// Parse application deadline if provided
	var applicationDeadline *time.Time
	if request.ApplicationDeadline != nil {
		parsedTime, err := time.Parse("2006-01-02T15:04:05Z", *request.ApplicationDeadline)
		if err != nil {
			panic(exception.NewBadRequestError("Invalid application deadline format. Use: 2006-01-02T15:04:05Z"))
		}
		applicationDeadline = &parsedTime
	}

	// Update job vacancy
	existingJobVacancy.Title = request.Title
	existingJobVacancy.Description = request.Description
	existingJobVacancy.Requirements = request.Requirements
	existingJobVacancy.Location = request.Location
	existingJobVacancy.JobType = request.JobType
	existingJobVacancy.ExperienceLevel = domain.ExperienceLevel(request.ExperienceLevel)
	existingJobVacancy.MinSalary = request.MinSalary
	existingJobVacancy.MaxSalary = request.MaxSalary
	existingJobVacancy.Currency = request.Currency
	existingJobVacancy.Skills = domain.SkillsArray(request.Skills)
	existingJobVacancy.Benefits = request.Benefits
	existingJobVacancy.WorkType = domain.WorkType(request.WorkType)
	existingJobVacancy.ApplicationDeadline = applicationDeadline
	existingJobVacancy.Status = domain.JobVacancyStatus(request.Status)
	existingJobVacancy.TypeApply = domain.JobApplyType(request.TypeApply)
	existingJobVacancy.ExternalLink = request.ExternalLink

	// Update in repository
	updatedJobVacancy := service.JobVacancyRepository.Update(ctx, tx, existingJobVacancy)

	// Fetch updated data with relations
	updatedJobVacancy, err = service.JobVacancyRepository.FindById(ctx, tx, updatedJobVacancy.Id)
	helper.PanicIfError(err)

	return service.toJobVacancyResponse(ctx, tx, updatedJobVacancy, &userId)
}

func (service *JobVacancyServiceImpl) Delete(ctx context.Context, jobVacancyId uuid.UUID, userId uuid.UUID) error {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job vacancy exists
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check if user has permission to delete
	if existingJobVacancy.CreatorId == nil || *existingJobVacancy.CreatorId != userId {
		panic(exception.NewForbiddenError("You don't have permission to delete this job vacancy"))
	}

	// Delete job vacancy
	err = service.JobVacancyRepository.Delete(ctx, tx, jobVacancyId)
	helper.PanicIfError(err)

	return nil
}

func (service *JobVacancyServiceImpl) FindById(ctx context.Context, jobVacancyId uuid.UUID, userId *uuid.UUID) web.JobVacancyResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	return service.toJobVacancyResponse(ctx, tx, jobVacancy, userId)
}

func (service *JobVacancyServiceImpl) FindByCompanyId(ctx context.Context, companyId uuid.UUID, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get job vacancies
	jobVacancies := service.JobVacancyRepository.FindByCompanyId(ctx, tx, companyId, pageSize, offset)

	// Get total count
	totalCount := service.JobVacancyRepository.CountByCompanyId(ctx, tx, companyId)

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Convert to response with user-specific data
	jobVacancyResponses := service.toJobVacancyResponses(ctx, tx, jobVacancies, userId)

	return web.JobVacancyListResponse{
		Jobs:       jobVacancyResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

func (service *JobVacancyServiceImpl) FindByCreatorId(ctx context.Context, creatorId uuid.UUID, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get job vacancies by creator
	jobVacancies := service.JobVacancyRepository.FindByCreatorId(ctx, tx, creatorId, pageSize, offset)

	// Get total count
	totalCount := service.JobVacancyRepository.CountByCreatorId(ctx, tx, creatorId)

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Convert to response
	jobVacancyResponses := service.toJobVacancyResponses(ctx, tx, jobVacancies, userId)

	return web.JobVacancyListResponse{
		Jobs:       jobVacancyResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

func (service *JobVacancyServiceImpl) FindAll(ctx context.Context, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get all job vacancies
	jobVacancies := service.JobVacancyRepository.FindAll(ctx, tx, pageSize, offset)

	// Get total count
	totalCount := service.JobVacancyRepository.CountAll(ctx, tx)

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Convert to response
	jobVacancyResponses := service.toJobVacancyResponses(ctx, tx, jobVacancies, userId)

	return web.JobVacancyListResponse{
		Jobs:       jobVacancyResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

func (service *JobVacancyServiceImpl) FindActiveJobs(ctx context.Context, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get active job vacancies
	jobVacancies := service.JobVacancyRepository.FindActiveJobs(ctx, tx, pageSize, offset)

	// Get total count
	totalCount := service.JobVacancyRepository.CountActiveJobs(ctx, tx)

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Convert to response with user-specific data
	jobVacancyResponses := service.toJobVacancyResponses(ctx, tx, jobVacancies, userId)

	return web.JobVacancyListResponse{
		Jobs:       jobVacancyResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

func (service *JobVacancyServiceImpl) SearchJobs(ctx context.Context, request web.JobVacancySearchRequest, userId *uuid.UUID) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if request.Page <= 0 {
		request.Page = 1
	}
	if request.PageSize <= 0 || request.PageSize > 100 {
		request.PageSize = 10
	}

	// Calculate offset
	offset := (request.Page - 1) * request.PageSize

	// Build filters map
	filters := make(map[string]interface{})
	if request.Search != "" {
		filters["search"] = request.Search
	}
	if request.Location != "" {
		filters["location"] = request.Location
	}
	if request.JobType != "" {
		filters["job_type"] = request.JobType
	}
	if request.ExperienceLevel != "" {
		filters["experience_level"] = request.ExperienceLevel
	}
	if request.WorkType != "" {
		filters["work_type"] = request.WorkType
	}
	if request.MinSalary != nil {
		filters["min_salary"] = *request.MinSalary
	}
	if request.MaxSalary != nil {
		filters["max_salary"] = *request.MaxSalary
	}
	if len(request.Skills) > 0 {
		filters["skills"] = request.Skills
	}

	// Search job vacancies
	jobVacancies := service.JobVacancyRepository.SearchJobs(ctx, tx, filters, request.PageSize, offset)

	// Get total count
	totalCount := service.JobVacancyRepository.CountSearchResults(ctx, tx, filters)

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(request.PageSize)))

	// Convert to response with user-specific data
	jobVacancyResponses := service.toJobVacancyResponses(ctx, tx, jobVacancies, userId)

	return web.JobVacancyListResponse{
		Jobs:       jobVacancyResponses,
		TotalCount: totalCount,
		Page:       request.Page,
		PageSize:   request.PageSize,
		TotalPages: totalPages,
	}
}

func (service *JobVacancyServiceImpl) UpdateStatus(ctx context.Context, jobVacancyId uuid.UUID, status string, userId uuid.UUID) error {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job vacancy exists
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check if user has permission to update
	if existingJobVacancy.CreatorId == nil || *existingJobVacancy.CreatorId != userId {
		panic(exception.NewForbiddenError("You don't have permission to update this job vacancy"))
	}

	// Update status
	err = service.JobVacancyRepository.UpdateStatus(ctx, tx, jobVacancyId, domain.JobVacancyStatus(status))
	helper.PanicIfError(err)

	return nil
}

func (service *JobVacancyServiceImpl) GetPublicJobDetail(ctx context.Context, jobVacancyId uuid.UUID, userId *uuid.UUID) web.JobVacancyPublicResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	response := web.JobVacancyPublicResponse{
		Id:                  jobVacancy.Id.String(),
		CompanyId:           jobVacancy.CompanyId.String(),
		Title:               jobVacancy.Title,
		Description:         jobVacancy.Description,
		Requirements:        jobVacancy.Requirements,
		Location:            jobVacancy.Location,
		JobType:             jobVacancy.JobType,
		ExperienceLevel:     string(jobVacancy.ExperienceLevel),
		MinSalary:           jobVacancy.MinSalary,
		MaxSalary:           jobVacancy.MaxSalary,
		Currency:            jobVacancy.Currency,
		Skills:              []string(jobVacancy.Skills),
		Benefits:            jobVacancy.Benefits,
		WorkType:            string(jobVacancy.WorkType),
		ApplicationDeadline: jobVacancy.ApplicationDeadline,
		TypeApply:           string(jobVacancy.TypeApply),
		ExternalLink:        jobVacancy.ExternalLink,
		HasApplied:          false,
		IsSaved:             false,
		CreatedAt:           jobVacancy.CreatedAt,
	}

	// Set company info if available
	if jobVacancy.Company != nil {
		response.Company = &web.CompanyBasicResponse{
			Id:   jobVacancy.Company.Id.String(),
			Name: jobVacancy.Company.Name,
			Logo: &jobVacancy.Company.Logo,
		}
	}

	// Set user-specific data if userId is provided
	if userId != nil {
		// Check if user has applied
		response.HasApplied = service.JobApplicationRepository.HasApplied(ctx, tx, jobVacancy.Id, *userId)

		// Check if user has saved this job
		response.IsSaved = service.SavedJobRepository.IsJobSaved(ctx, tx, *userId, jobVacancy.Id)
	}

	return response
}

// FindByCompanyIdWithStatus
func (service *JobVacancyServiceImpl) FindByCompanyIdWithStatus(ctx context.Context, companyId uuid.UUID, status string, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get job vacancies
	jobVacancies := service.JobVacancyRepository.FindByCompanyIdWithStatus(ctx, tx, companyId, domain.JobVacancyStatus(status), pageSize, offset)

	// Get total count
	totalCount := service.JobVacancyRepository.CountByCompanyIdWithStatus(ctx, tx, companyId, domain.JobVacancyStatus(status))

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Convert to response with user-specific data
	jobVacancyResponses := service.toJobVacancyResponses(ctx, tx, jobVacancies, userId)

	return web.JobVacancyListResponse{
		Jobs:       jobVacancyResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

// GetRandomJobs returns a random selection of job vacancies
func (service *JobVacancyServiceImpl) GetRandomJobs(ctx context.Context, page, pageSize int, userId *uuid.UUID) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10

	}
	// Calculate offset
	offset := (page - 1) * pageSize
	// Get random job vacancies
	jobVacancies, totalCount := service.JobVacancyRepository.FindRandomJobs(ctx, tx, pageSize, offset)
	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))
	// Convert to response with user-specific data
	jobVacancyResponses := service.toJobVacancyResponses(ctx, tx, jobVacancies, userId)
	return web.JobVacancyListResponse{
		Jobs: jobVacancyResponses,

		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

// Helper functions
func (service *JobVacancyServiceImpl) toJobVacancyResponse(ctx context.Context, tx *sql.Tx, jobVacancy domain.JobVacancy, userId *uuid.UUID) web.JobVacancyResponse {
	response := web.JobVacancyResponse{
		Id:                  jobVacancy.Id.String(),
		CompanyId:           jobVacancy.CompanyId.String(),
		CreatorId:           nil,
		Title:               jobVacancy.Title,
		Description:         jobVacancy.Description,
		Requirements:        jobVacancy.Requirements,
		Location:            jobVacancy.Location,
		JobType:             jobVacancy.JobType,
		ExperienceLevel:     string(jobVacancy.ExperienceLevel),
		MinSalary:           jobVacancy.MinSalary,
		MaxSalary:           jobVacancy.MaxSalary,
		Currency:            jobVacancy.Currency,
		Skills:              []string(jobVacancy.Skills),
		Benefits:            jobVacancy.Benefits,
		WorkType:            string(jobVacancy.WorkType),
		ApplicationDeadline: jobVacancy.ApplicationDeadline,
		Status:              string(jobVacancy.Status),
		TypeApply:           string(jobVacancy.TypeApply),
		ExternalLink:        jobVacancy.ExternalLink,
		HasApplied:          false,
		IsSaved:             false,
		CreatedAt:           jobVacancy.CreatedAt,
		UpdatedAt:           jobVacancy.UpdatedAt,
		TakenDownAt:         jobVacancy.TakenDownAt,
	}

	// Set creator ID if exists
	if jobVacancy.CreatorId != nil {
		creatorIdStr := jobVacancy.CreatorId.String()
		response.CreatorId = &creatorIdStr
	}

	// Set company info if available
	if jobVacancy.Company != nil {
		response.Company = &web.CompanyBasicResponse{
			Id:   jobVacancy.Company.Id.String(),
			Name: jobVacancy.Company.Name,
			Logo: &jobVacancy.Company.Logo,
		}
	}

	// Set creator info if available
	if jobVacancy.Creator != nil {
		response.Creator = &web.UserBasicResponse{
			Id:       jobVacancy.Creator.Id.String(),
			Name:     jobVacancy.Creator.Name,
			Username: jobVacancy.Creator.Username,
			Photo:    &jobVacancy.Creator.Photo,
		}
	}

	// Set user-specific data if userId is provided
	if userId != nil {
		// Check if user has applied
		response.HasApplied = service.JobApplicationRepository.HasApplied(ctx, tx, jobVacancy.Id, *userId)

		// Check if user has saved this job
		response.IsSaved = service.SavedJobRepository.IsJobSaved(ctx, tx, *userId, jobVacancy.Id)
	}

	return response
}

// Helper method to convert multiple domain objects to responses
func (service *JobVacancyServiceImpl) toJobVacancyResponses(ctx context.Context, tx *sql.Tx, jobVacancies []domain.JobVacancy, userId *uuid.UUID) []web.JobVacancyResponse {
	var responses []web.JobVacancyResponse
	for _, jobVacancy := range jobVacancies {
		responses = append(responses, service.toJobVacancyResponse(ctx, tx, jobVacancy, userId))
	}
	return responses
}

func toJobVacancyPublicResponse(jobVacancy domain.JobVacancy) web.JobVacancyPublicResponse {
	var companyInfo *web.CompanyBasicResponse
	if jobVacancy.Company != nil {
		companyInfo = &web.CompanyBasicResponse{
			Id:   jobVacancy.Company.Id.String(),
			Name: jobVacancy.Company.Name,
			Logo: &jobVacancy.Company.Logo,
		}
	}

	return web.JobVacancyPublicResponse{
		Id:                  jobVacancy.Id.String(),
		Title:               jobVacancy.Title,
		Description:         jobVacancy.Description,
		Location:            jobVacancy.Location,
		JobType:             jobVacancy.JobType,
		ExperienceLevel:     string(jobVacancy.ExperienceLevel),
		MinSalary:           jobVacancy.MinSalary,
		MaxSalary:           jobVacancy.MaxSalary,
		Currency:            jobVacancy.Currency,
		Skills:              jobVacancy.Skills,
		WorkType:            string(jobVacancy.WorkType),
		ApplicationDeadline: jobVacancy.ApplicationDeadline,
		TypeApply:           string(jobVacancy.TypeApply),
		ExternalLink:        jobVacancy.ExternalLink,
		CreatedAt:           jobVacancy.CreatedAt,
		Company:             companyInfo,
	}
}


func (service *JobVacancyServiceImpl) sendNotificationToCompanyFollowers(jobVacancy domain.JobVacancy, creatorId uuid.UUID) {
	if service.NotificationService == nil {
		return
	}

	go func() {
		tx, err := service.DB.Begin()
		if err != nil {
			return
		}
		defer helper.CommitOrRollback(tx)

		// Get company info
		company, err := service.CompanyRepository.FindById(context.Background(), tx, jobVacancy.CompanyId)
		if err != nil {
			return
		}

		// Get company followers
		followers, _, err := service.CompanyFollowerRepository.FindFollowersByCompanyId(context.Background(), tx, jobVacancy.CompanyId, 1000, 0)
		if err != nil {
			return
		}

		refType := "job_vacancy_new"
		notificationTitle := "New Job Opening at " + company.Name

		// Send to 90% of followers randomly
		for i, follower := range followers {
			if follower.UserId != creatorId && i%10 < 9 {
				service.NotificationService.Create(
					context.Background(),
					follower.UserId,
					string(domain.NotificationCategoryCompany),
					"job_vacancy_new",
					notificationTitle,
					fmt.Sprintf("%s is hiring: %s in %s", company.Name, jobVacancy.Title, jobVacancy.Location),
					&jobVacancy.Id,
					&refType,
					&creatorId,
				)
			}
		}
	}()
}
