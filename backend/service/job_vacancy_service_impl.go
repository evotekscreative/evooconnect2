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

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type JobVacancyServiceImpl struct {
	JobVacancyRepository repository.JobVacancyRepository
	CompanyRepository    repository.CompanyRepository
	UserRepository       repository.UserRepository
	DB                   *sql.DB
	Validate             *validator.Validate
}

func NewJobVacancyService(jobVacancyRepository repository.JobVacancyRepository, companyRepository repository.CompanyRepository, userRepository repository.UserRepository, db *sql.DB, validate *validator.Validate) JobVacancyService {
	return &JobVacancyServiceImpl{
		JobVacancyRepository: jobVacancyRepository,
		CompanyRepository:    companyRepository,
		UserRepository:       userRepository,
		DB:                   db,
		Validate:             validate,
	}
}

func (service *JobVacancyServiceImpl) Create(ctx context.Context, request web.CreateJobVacancyRequest, creatorId uuid.UUID) web.JobVacancyResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	// Validate type_apply and external_link combination
	if request.TypeApply == "external_apply" {
		if request.ExternalLink == nil || *request.ExternalLink == "" {
			panic(exception.NewBadRequestError("External link is required when type_apply is external_apply"))
		}
	}

	// Validate salary range
	if request.MinSalary != nil && request.MaxSalary != nil && *request.MinSalary > *request.MaxSalary {
		panic(exception.NewBadRequestError("Min salary cannot be greater than max salary"))
	}

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Verify company exists and user has permission
	company, err := service.CompanyRepository.FindById(ctx, tx, uuid.MustParse(request.CompanyId.String()))
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Check if user is owner or member of the company
	// For now, we'll assume the creator is authorized
	_ = company

	// Parse application deadline if provided
	var applicationDeadline *time.Time
	if request.ApplicationDeadline != nil && *request.ApplicationDeadline != "" {
		parsedTime, err := time.Parse("2006-01-02T15:04:05Z", *request.ApplicationDeadline)
		if err != nil {
			// Try alternative format
			parsedTime, err = time.Parse("2006-01-02", *request.ApplicationDeadline)
			if err != nil {
				panic(exception.NewBadRequestError("Invalid date format for application deadline"))
			}
		}
		applicationDeadline = &parsedTime
	}

	// Create job vacancy domain
	jobVacancy := domain.JobVacancy{
		Id:                  uuid.New(),
		CompanyId:           uuid.MustParse(request.CompanyId.String()),
		CreatorId:           &creatorId,
		Title:               request.Title,
		Description:         request.Description,
		Requirements:        request.Requirements,
		Location:            request.Location,
		JobType:             domain.JobType(request.JobType),
		ExperienceLevel:     domain.ExperienceLevel(request.ExperienceLevel),
		MinSalary:           request.MinSalary,
		MaxSalary:           request.MaxSalary,
		Currency:            request.Currency,
		Skills:              domain.SkillsArray(request.Skills),
		Benefits:            request.Benefits,
		WorkType:            domain.WorkType(request.WorkType),
		ApplicationDeadline: applicationDeadline,
		Status:              domain.JobVacancyStatusDraft,
		TypeApply:           domain.JobApplyType(request.TypeApply),
		ExternalLink:        request.ExternalLink,
	}

	// Create job vacancy
	createdJobVacancy := service.JobVacancyRepository.Create(ctx, tx, jobVacancy)

	// Fetch complete data with relations
	completeJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, createdJobVacancy.Id)
	helper.PanicIfError(err)

	return toJobVacancyResponse(completeJobVacancy)
}

func (service *JobVacancyServiceImpl) Update(ctx context.Context, request web.UpdateJobVacancyRequest, jobVacancyId uuid.UUID, userId uuid.UUID) web.JobVacancyResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	// Validate type_apply and external_link combination
	if request.TypeApply == "external_apply" {
		if request.ExternalLink == nil || *request.ExternalLink == "" {
			panic(exception.NewBadRequestError("External link is required when type_apply is external_apply"))
		}
	}

	// Validate salary range
	if request.MinSalary != nil && request.MaxSalary != nil && *request.MinSalary > *request.MaxSalary {
		panic(exception.NewBadRequestError("Min salary cannot be greater than max salary"))
	}

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job vacancy exists
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check if user has permission to update (creator or company owner/admin)
	if existingJobVacancy.CreatorId == nil || *existingJobVacancy.CreatorId != userId {
		// Additional check: verify if user is company owner/admin
		// For now, we'll just check creator
		panic(exception.NewForbiddenError("You don't have permission to update this job vacancy"))
	}

	// Parse application deadline if provided
	var applicationDeadline *time.Time
	if request.ApplicationDeadline != nil && *request.ApplicationDeadline != "" {
		parsedTime, err := time.Parse("2006-01-02T15:04:05Z", *request.ApplicationDeadline)
		if err != nil {
			// Try alternative format
			parsedTime, err = time.Parse("2006-01-02", *request.ApplicationDeadline)
			if err != nil {
				panic(exception.NewBadRequestError("Invalid date format for application deadline"))
			}
		}
		applicationDeadline = &parsedTime
	}

	// Update job vacancy
	updatedJobVacancy := domain.JobVacancy{
		Id:                  jobVacancyId,
		CompanyId:           existingJobVacancy.CompanyId,
		CreatorId:           existingJobVacancy.CreatorId,
		Title:               request.Title,
		Description:         request.Description,
		Requirements:        request.Requirements,
		Location:            request.Location,
		JobType:             domain.JobType(request.JobType),
		ExperienceLevel:     domain.ExperienceLevel(request.ExperienceLevel),
		MinSalary:           request.MinSalary,
		MaxSalary:           request.MaxSalary,
		Currency:            request.Currency,
		Skills:              domain.SkillsArray(request.Skills),
		Benefits:            request.Benefits,
		WorkType:            domain.WorkType(request.WorkType),
		ApplicationDeadline: applicationDeadline,
		Status:              domain.JobVacancyStatus(request.Status),
		TypeApply:           domain.JobApplyType(request.TypeApply),
		ExternalLink:        request.ExternalLink,
		CreatedAt:           existingJobVacancy.CreatedAt,
	}

	// Update in repository
	service.JobVacancyRepository.Update(ctx, tx, updatedJobVacancy)

	// Fetch updated data with relations
	completeJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	helper.PanicIfError(err)

	return toJobVacancyResponse(completeJobVacancy)
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
	if err != nil {
		panic(exception.NewInternalServerError("Failed to delete job vacancy"))
	}

	return nil
}

func (service *JobVacancyServiceImpl) FindById(ctx context.Context, jobVacancyId uuid.UUID) web.JobVacancyResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	return toJobVacancyResponse(jobVacancy)
}

func (service *JobVacancyServiceImpl) FindByCompanyId(ctx context.Context, companyId uuid.UUID, page, pageSize int) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get job vacancies
	jobVacancies := service.JobVacancyRepository.FindByCompanyId(ctx, tx, companyId, pageSize, offset)
	totalCount := service.JobVacancyRepository.CountByCompanyId(ctx, tx, companyId)

	// Convert to response
	var jobResponses []web.JobVacancyResponse
	for _, job := range jobVacancies {
		jobResponses = append(jobResponses, toJobVacancyResponse(job))
	}

	return web.JobVacancyListResponse{
		Jobs:       jobResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int(math.Ceil(float64(totalCount) / float64(pageSize))),
	}
}

func (service *JobVacancyServiceImpl) FindByCreatorId(ctx context.Context, creatorId uuid.UUID, page, pageSize int) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get job vacancies
	jobVacancies := service.JobVacancyRepository.FindByCreatorId(ctx, tx, creatorId, pageSize, offset)
	totalCount := service.JobVacancyRepository.CountByCreatorId(ctx, tx, creatorId)

	// Convert to response
	var jobResponses []web.JobVacancyResponse
	for _, job := range jobVacancies {
		jobResponses = append(jobResponses, toJobVacancyResponse(job))
	}

	return web.JobVacancyListResponse{
		Jobs:       jobResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int(math.Ceil(float64(totalCount) / float64(pageSize))),
	}
}

func (service *JobVacancyServiceImpl) FindAll(ctx context.Context, page, pageSize int) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get job vacancies
	jobVacancies := service.JobVacancyRepository.FindAll(ctx, tx, pageSize, offset)
	totalCount := service.JobVacancyRepository.CountAll(ctx, tx)

	// Convert to response
	var jobResponses []web.JobVacancyResponse
	for _, job := range jobVacancies {
		jobResponses = append(jobResponses, toJobVacancyResponse(job))
	}

	return web.JobVacancyListResponse{
		Jobs:       jobResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int(math.Ceil(float64(totalCount) / float64(pageSize))),
	}
}

func (service *JobVacancyServiceImpl) FindActiveJobs(ctx context.Context, page, pageSize int) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get active job vacancies
	jobVacancies := service.JobVacancyRepository.FindActiveJobs(ctx, tx, pageSize, offset)
	totalCount := service.JobVacancyRepository.CountActiveJobs(ctx, tx)

	// Convert to response
	var jobResponses []web.JobVacancyResponse
	for _, job := range jobVacancies {
		jobResponses = append(jobResponses, toJobVacancyResponse(job))
	}

	return web.JobVacancyListResponse{
		Jobs:       jobResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int(math.Ceil(float64(totalCount) / float64(pageSize))),
	}
}

func (service *JobVacancyServiceImpl) SearchJobs(ctx context.Context, request web.JobVacancySearchRequest) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if request.Page <= 0 {
		request.Page = 1
	}
	if request.PageSize <= 0 {
		request.PageSize = 10
	}

	// Calculate offset
	offset := (request.Page - 1) * request.PageSize

	// Build filters map
	filters := make(map[string]interface{})

	if request.Query != "" {
		filters["query"] = request.Query
	}
	if request.Location != "" {
		filters["location"] = request.Location
	}
	if len(request.JobType) > 0 {
		filters["job_type"] = request.JobType
	}
	if len(request.ExperienceLevel) > 0 {
		filters["experience_level"] = request.ExperienceLevel
	}
	if len(request.WorkType) > 0 {
		filters["work_type"] = request.WorkType
	}
	if request.MinSalary != nil {
		filters["min_salary"] = *request.MinSalary
	}
	if request.MaxSalary != nil {
		filters["max_salary"] = *request.MaxSalary
	}
	if request.CompanyId != nil && *request.CompanyId != "" {
		filters["company_id"] = *request.CompanyId
	}

	// Search job vacancies
	jobVacancies := service.JobVacancyRepository.SearchJobs(ctx, tx, filters, request.PageSize, offset)
	totalCount := service.JobVacancyRepository.CountSearchResults(ctx, tx, filters)

	// Convert to response
	var jobResponses []web.JobVacancyResponse
	for _, job := range jobVacancies {
		jobResponses = append(jobResponses, toJobVacancyResponse(job))
	}

	return web.JobVacancyListResponse{
		Jobs:       jobResponses,
		TotalCount: totalCount,
		Page:       request.Page,
		PageSize:   request.PageSize,
		TotalPages: int(math.Ceil(float64(totalCount) / float64(request.PageSize))),
	}
}

func (service *JobVacancyServiceImpl) UpdateStatus(ctx context.Context, jobVacancyId uuid.UUID, status string, userId uuid.UUID) error {
	// Validate status
	validStatuses := []string{"draft", "active", "closed", "archived"}
	isValidStatus := false
	for _, validStatus := range validStatuses {
		if status == validStatus {
			isValidStatus = true
			break
		}
	}
	if !isValidStatus {
		panic(exception.NewBadRequestError("Invalid status"))
	}

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job vacancy exists and user has permission
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check permission
	if existingJobVacancy.CreatorId == nil || *existingJobVacancy.CreatorId != userId {
		panic(exception.NewForbiddenError("You don't have permission to update this job vacancy"))
	}

	// Update status
	err = service.JobVacancyRepository.UpdateStatus(ctx, tx, jobVacancyId, domain.JobVacancyStatus(status))
	if err != nil {
		panic(exception.NewInternalServerError("Failed to update job vacancy status"))
	}

	return nil
}

func (service *JobVacancyServiceImpl) GetPublicJobDetail(ctx context.Context, jobVacancyId uuid.UUID) web.JobVacancyPublicResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Only return active jobs for public view
	if jobVacancy.Status != domain.JobVacancyStatusActive {
		panic(exception.NewNotFoundError("Job vacancy not available"))
	}

	return toJobVacancyPublicResponse(jobVacancy)
}

// Helper functions
func toJobVacancyResponse(jobVacancy domain.JobVacancy) web.JobVacancyResponse {
	response := web.JobVacancyResponse{
		Id:                  jobVacancy.Id.String(),
		CompanyId:           jobVacancy.CompanyId.String(),
		Title:               jobVacancy.Title,
		Description:         jobVacancy.Description,
		Requirements:        jobVacancy.Requirements,
		Location:            jobVacancy.Location,
		JobType:             string(jobVacancy.JobType),
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
		CreatedAt:           jobVacancy.CreatedAt,
		UpdatedAt:           jobVacancy.UpdatedAt,
	}

	if jobVacancy.CreatorId != nil {
		creatorIdStr := jobVacancy.CreatorId.String()
		response.CreatorId = &creatorIdStr
	}

	if jobVacancy.Company != nil {
		response.Company = &web.CompanyBasicResponse{
			Id:       jobVacancy.Company.Id.String(),
			Name:     jobVacancy.Company.Name,
			Logo:     &jobVacancy.Company.Logo,
			Industry: jobVacancy.Company.Industry,
		}
	}

	if jobVacancy.Creator != nil {
		response.Creator = &web.UserBasicResponse{
			Id:       jobVacancy.Creator.Id.String(),
			Name:     jobVacancy.Creator.Name,
			Email:    jobVacancy.Creator.Email,
			Username: jobVacancy.Creator.Username,
			Photo:    &jobVacancy.Creator.Photo,
		}
	}

	return response
}

func toJobVacancyPublicResponse(jobVacancy domain.JobVacancy) web.JobVacancyPublicResponse {
	response := web.JobVacancyPublicResponse{
		Id:                  jobVacancy.Id.String(),
		CompanyId:           jobVacancy.CompanyId.String(),
		Title:               jobVacancy.Title,
		Description:         jobVacancy.Description,
		Location:            jobVacancy.Location,
		JobType:             string(jobVacancy.JobType),
		ExperienceLevel:     string(jobVacancy.ExperienceLevel),
		MinSalary:           jobVacancy.MinSalary,
		MaxSalary:           jobVacancy.MaxSalary,
		Currency:            jobVacancy.Currency,
		Skills:              []string(jobVacancy.Skills),
		WorkType:            string(jobVacancy.WorkType),
		ApplicationDeadline: jobVacancy.ApplicationDeadline,
		TypeApply:           string(jobVacancy.TypeApply),
		ExternalLink:        jobVacancy.ExternalLink,
		CreatedAt:           jobVacancy.CreatedAt,
	}

	if jobVacancy.Company != nil {
		response.Company = &web.CompanyBasicResponse{
			Id:       jobVacancy.Company.Id.String(),
			Name:     jobVacancy.Company.Name,
			Logo:     &jobVacancy.Company.Logo,
			Industry: jobVacancy.Company.Industry,
		}
	}

	return response
}
