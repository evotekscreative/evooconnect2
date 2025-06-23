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

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type SavedJobServiceImpl struct {
	SavedJobRepository   repository.SavedJobRepository
	JobVacancyRepository repository.JobVacancyRepository
	DB                   *sql.DB
	Validate             *validator.Validate
}

func NewSavedJobService(
	savedJobRepository repository.SavedJobRepository,
	jobVacancyRepository repository.JobVacancyRepository,
	db *sql.DB,
	validate *validator.Validate) SavedJobService {
	return &SavedJobServiceImpl{
		SavedJobRepository:   savedJobRepository,
		JobVacancyRepository: jobVacancyRepository,
		DB:                   db,
		Validate:             validate,
	}
}

func (service *SavedJobServiceImpl) SaveJob(ctx context.Context, userId, jobVacancyId uuid.UUID) web.SavedJobResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job vacancy exists
	jobVacancy, err := service.JobVacancyRepository.FindById(ctx, tx, jobVacancyId)
	if err != nil {
		panic(exception.NewNotFoundError("Job vacancy not found"))
	}

	// Check if already saved
	if service.SavedJobRepository.IsJobSaved(ctx, tx, userId, jobVacancyId) {
		panic(exception.NewBadRequestError("Job already saved"))
	}

	// Save job
	savedJob := domain.SavedJob{
		UserId:       userId,
		JobVacancyId: jobVacancyId,
	}

	savedJob = service.SavedJobRepository.Save(ctx, tx, savedJob)

	// Get complete job vacancy for response
	savedJob.JobVacancy = &jobVacancy

	// Convert to response
	return toSavedJobResponse(savedJob)
}

func (service *SavedJobServiceImpl) UnsaveJob(ctx context.Context, userId, jobVacancyId uuid.UUID) error {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if job is saved
	if !service.SavedJobRepository.IsJobSaved(ctx, tx, userId, jobVacancyId) {
		panic(exception.NewNotFoundError("Job not saved"))
	}

	// Delete saved job
	err = service.SavedJobRepository.Delete(ctx, tx, userId, jobVacancyId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to unsave job"))
	}

	return nil
}

func (service *SavedJobServiceImpl) FindSavedJobs(ctx context.Context, userId uuid.UUID, page, pageSize int) web.SavedJobListResponse {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Set default pagination values
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Get saved jobs
	savedJobs := service.SavedJobRepository.FindByUserId(ctx, tx, userId, pageSize, offset)

	// Get total count
	totalCount := service.SavedJobRepository.CountByUserId(ctx, tx, userId)

	// Convert to response
	var savedJobResponses []web.SavedJobResponse
	for _, savedJob := range savedJobs {
		savedJobResponses = append(savedJobResponses, toSavedJobResponse(savedJob))
	}

	return web.SavedJobListResponse{
		Jobs:       savedJobResponses,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: int(math.Ceil(float64(totalCount) / float64(pageSize))),
	}
}

func (service *SavedJobServiceImpl) IsJobSaved(ctx context.Context, userId, jobVacancyId uuid.UUID) bool {
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	return service.SavedJobRepository.IsJobSaved(ctx, tx, userId, jobVacancyId)
}

// Helper function to convert domain.SavedJob to web.SavedJobResponse
func toSavedJobResponse(savedJob domain.SavedJob) web.SavedJobResponse {
	response := web.SavedJobResponse{
		Id:           savedJob.Id,
		UserId:       savedJob.UserId,
		JobVacancyId: savedJob.JobVacancyId,
		CreatedAt:    savedJob.CreatedAt,
	}

	if savedJob.JobVacancy != nil {
		jobVacancyResponse := helper.ToJobVacancyResponse(*savedJob.JobVacancy)
		response.JobVacancy = &jobVacancyResponse
	}

	return response
}
