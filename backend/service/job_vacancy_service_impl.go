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

type JobVacancyServiceImpl struct {
	JobVacancyRepository repository.JobVacancyRepository
	CompanyRepository    repository.CompanyRepository
	UserRepository       repository.UserRepository
	DB                   *sql.DB
	NotificationService  NotificationService
	Validate             *validator.Validate
}

func NewJobVacancyService(
	jobVacancyRepository repository.JobVacancyRepository,
	companyRepository repository.CompanyRepository,
	userRepository repository.UserRepository,
	DB *sql.DB,
	notificationService NotificationService,
	validate *validator.Validate,
) JobVacancyService {
	return &JobVacancyServiceImpl{
		JobVacancyRepository: jobVacancyRepository,
		CompanyRepository:    companyRepository,
		UserRepository:       userRepository,
		DB:                   DB,
		NotificationService:  notificationService,
		Validate:             validate,
	}
}

func (service *JobVacancyServiceImpl) Create(ctx context.Context, request web.CreateJobVacancyRequest, companyId uuid.UUID, creatorId uuid.UUID) web.JobVacancyResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Validate company exists
	_, err = service.CompanyRepository.FindById(ctx, tx, companyId)
	if err != nil {
		panic(exception.NewNotFoundError("Company not found"))
	}

	// Validate salary range
	if request.SalaryMin != nil && request.SalaryMax != nil && *request.SalaryMin > *request.SalaryMax {
		panic(exception.NewBadRequestError("Minimum salary cannot be greater than maximum salary"))
	}

	// Create job vacancy
	jobVacancy := domain.JobVacancy{
		Id:                   uuid.New(),
		CompanyId:            companyId,
		CreatorId:            creatorId,
		Title:                request.Title,
		Department:           request.Department,
		JobType:              domain.JobType(request.JobType),
		Location:             request.Location,
		SalaryMin:            request.SalaryMin,
		SalaryMax:            request.SalaryMax,
		Currency:             request.Currency,
		ExperienceLevel:      domain.ExperienceLevel(request.ExperienceLevel),
		EducationRequirement: request.EducationRequirement,
		JobDescription:       request.JobDescription,
		Requirements:         request.Requirements,
		Benefits:             request.Benefits,
		SkillsRequired:       domain.SkillsArray(request.SkillsRequired),
		ApplicationDeadline:  request.ApplicationDeadline,
		Status:               domain.JobVacancyStatusDraft,
		IsUrgent:             request.IsUrgent,
		RemoteWorkAllowed:    request.RemoteWorkAllowed,
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}

	if request.Currency == "" {
		jobVacancy.Currency = "IDR"
	}

	jobVacancy = service.JobVacancyRepository.Create(ctx, tx, jobVacancy)

	// Get created job vacancy with relations
	result, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancy.Id)
	helper.PanicIfError(err)

	return helper.ToJobVacancyResponse(result)
}

func (service *JobVacancyServiceImpl) Update(ctx context.Context, request web.UpdateJobVacancyRequest, jobVacancyId uuid.UUID, creatorId uuid.UUID) web.JobVacancyResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing job vacancy
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check ownership
	if existingJobVacancy.CreatorId != creatorId {
		panic(exception.NewForbiddenError("You can only update your own job vacancies"))
	}

	// Validate salary range
	if request.SalaryMin != nil && request.SalaryMax != nil && *request.SalaryMin > *request.SalaryMax {
		panic(exception.NewBadRequestError("Minimum salary cannot be greater than maximum salary"))
	}

	// Update job vacancy
	existingJobVacancy.Title = request.Title
	existingJobVacancy.Department = request.Department
	existingJobVacancy.JobType = domain.JobType(request.JobType)
	existingJobVacancy.Location = request.Location
	existingJobVacancy.SalaryMin = request.SalaryMin
	existingJobVacancy.SalaryMax = request.SalaryMax
	existingJobVacancy.Currency = request.Currency
	existingJobVacancy.ExperienceLevel = domain.ExperienceLevel(request.ExperienceLevel)
	existingJobVacancy.EducationRequirement = request.EducationRequirement
	existingJobVacancy.JobDescription = request.JobDescription
	existingJobVacancy.Requirements = request.Requirements
	existingJobVacancy.Benefits = request.Benefits
	existingJobVacancy.SkillsRequired = domain.SkillsArray(request.SkillsRequired)
	existingJobVacancy.ApplicationDeadline = request.ApplicationDeadline
	existingJobVacancy.IsUrgent = request.IsUrgent
	existingJobVacancy.RemoteWorkAllowed = request.RemoteWorkAllowed
	existingJobVacancy.UpdatedAt = time.Now()

	if request.Currency == "" {
		existingJobVacancy.Currency = "IDR"
	}

	updatedJobVacancy := service.JobVacancyRepository.Update(ctx, tx, existingJobVacancy)

	// Get updated job vacancy with relations
	result, err := service.JobVacancyRepository.FindById(ctx, tx, updatedJobVacancy.Id)
	helper.PanicIfError(err)

	return helper.ToJobVacancyResponse(result)
}

func (service *JobVacancyServiceImpl) Delete(ctx context.Context, jobVacancyId uuid.UUID, creatorId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing job vacancy
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check ownership
	if existingJobVacancy.CreatorId != creatorId {
		panic(exception.NewForbiddenError("You can only delete your own job vacancies"))
	}

	// Check if job vacancy has applications
	if existingJobVacancy.ApplicationCount > 0 {
		panic(exception.NewBadRequestError("Cannot delete job vacancy with existing applications"))
	}

	err = service.JobVacancyRepository.Delete(ctx, tx, jobVacancyId)
	helper.PanicIfError(err)
}

func (service *JobVacancyServiceImpl) FindById(ctx context.Context, jobVacancyId uuid.UUID) web.JobVacancyResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	return helper.ToJobVacancyResponse(jobVacancy)
}

func (service *JobVacancyServiceImpl) FindByCompany(ctx context.Context, companyId uuid.UUID, status string, limit, offset int) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancies, total, err := service.JobVacancyRepository.FindByCompanyId(ctx, tx, companyId, status, limit, offset)
	helper.PanicIfError(err)

	return web.JobVacancyListResponse{
		JobVacancies: helper.ToJobVacancyResponses(jobVacancies),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobVacancyServiceImpl) FindByCreator(ctx context.Context, creatorId uuid.UUID, limit, offset int) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancies, total, err := service.JobVacancyRepository.FindByCreatorId(ctx, tx, creatorId, limit, offset)
	helper.PanicIfError(err)

	return web.JobVacancyListResponse{
		JobVacancies: helper.ToJobVacancyResponses(jobVacancies),
		Total:        total,
		Limit:        limit,
		Offset:       offset,
	}
}

func (service *JobVacancyServiceImpl) FindWithFilters(ctx context.Context, request web.JobVacancyFilterRequest) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	jobVacancies, total, err := service.JobVacancyRepository.FindWithFilters(
		ctx, tx, request.CompanyId, request.JobType, request.ExperienceLevel,
		request.Location, request.Status, request.Search, request.RemoteWork,
		request.SalaryMin, request.SalaryMax, request.Limit, request.Offset)
	helper.PanicIfError(err)

	return web.JobVacancyListResponse{
		JobVacancies: helper.ToJobVacancyResponses(jobVacancies),
		Total:        total,
		Limit:        request.Limit,
		Offset:       request.Offset,
	}
}

func (service *JobVacancyServiceImpl) FindPublicJobs(ctx context.Context, request web.PublicJobSearchRequest) web.JobVacancyListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// For public jobs, only show published status
	jobVacancies, total, err := service.JobVacancyRepository.FindWithFilters(
		ctx, tx, request.CompanyId, request.JobType, request.ExperienceLevel,
		request.Location, "published", request.Search, request.RemoteWork,
		request.SalaryMin, request.SalaryMax, request.Limit, request.Offset)
	helper.PanicIfError(err)

	return web.JobVacancyListResponse{
		JobVacancies: helper.ToJobVacancyResponses(jobVacancies),
		Total:        total,
		Limit:        request.Limit,
		Offset:       request.Offset,
	}
}

func (service *JobVacancyServiceImpl) UpdateStatus(ctx context.Context, jobVacancyId uuid.UUID, status string, userId uuid.UUID) web.JobVacancyResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Find existing job vacancy
	existingJobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check ownership
	if existingJobVacancy.CreatorId != userId {
		panic(exception.NewForbiddenError("You can only update status of your own job vacancies"))
	}

	// Validate status
	validStatuses := []string{"draft", "published", "closed", "archived"}
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

	// Update status
	err = service.JobVacancyRepository.UpdateStatus(ctx, tx, jobVacancyId, domain.JobVacancyStatus(status))
	helper.PanicIfError(err)

	// Get updated job vacancy
	result, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	helper.PanicIfError(err)

	return helper.ToJobVacancyResponse(result)
}

func (service *JobVacancyServiceImpl) IncrementViewCount(ctx context.Context, jobVacancyId uuid.UUID) {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	err = service.JobVacancyRepository.UpdateViewCount(ctx, tx, jobVacancyId)
	helper.PanicIfError(err)
}

func (service *JobVacancyServiceImpl) GetStats(ctx context.Context, companyId *uuid.UUID) web.JobVacancyStatsResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	stats, err := service.JobVacancyRepository.GetStats(ctx, tx, companyId)
	helper.PanicIfError(err)

	return web.JobVacancyStatsResponse{
		Published: stats["published"],
		Draft:     stats["draft"],
		Closed:    stats["closed"],
		Archived:  stats["archived"],
	}
}

func (service *JobVacancyServiceImpl) GetCompanyJobStats(ctx context.Context, companyId uuid.UUID) web.JobVacancyStatsResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	stats, err := service.JobVacancyRepository.GetStats(ctx, tx, &companyId)
	helper.PanicIfError(err)

	return web.JobVacancyStatsResponse{
		Published: stats["published"],
		Draft:     stats["draft"],
		Closed:    stats["closed"],
		Archived:  stats["archived"],
	}
}
