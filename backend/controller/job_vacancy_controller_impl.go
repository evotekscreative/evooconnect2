package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type JobVacancyControllerImpl struct {
	JobVacancyService service.JobVacancyService
}

func NewJobVacancyController(jobVacancyService service.JobVacancyService) JobVacancyController {
	return &JobVacancyControllerImpl{
		JobVacancyService: jobVacancyService,
	}
}

func (controller *JobVacancyControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (set by auth middleware)
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid or missing token"))
	}

	// Set company ID from path parameter if not provided in body
	var companyId uuid.UUID
	if companyIdParam := params.ByName("companyId"); companyIdParam != "" {
		companyId, err = uuid.Parse(companyIdParam)
		if err != nil {
			panic(exception.NewBadRequestError("Invalid company ID"))
		}
	}

	// Parse request body
	var createRequest web.CreateJobVacancyRequest
	helper.ReadFromRequestBody(request, &createRequest)

	// Create job vacancy
	jobVacancyResponse := controller.JobVacancyService.Create(request.Context(), createRequest, companyId, userId)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid or missing token"))
	}

	// Get job vacancy ID from path
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid job vacancy ID"))
	}

	// Parse request body
	var updateRequest web.UpdateJobVacancyRequest
	helper.ReadFromRequestBody(request, &updateRequest)

	// Update job vacancy
	jobVacancyResponse := controller.JobVacancyService.Update(request.Context(), updateRequest, jobVacancyId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid or missing token"))
	}

	// Get job vacancy ID from path
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid job vacancy ID"))
	}

	// Delete job vacancy
	err = controller.JobVacancyService.Delete(request.Context(), jobVacancyId, userId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to delete job vacancy"))
	}

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Job vacancy deleted successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get job vacancy ID from URL params
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	helper.PanicIfError(err)

	// Get user ID from context (optional for public endpoints)
	var userId *uuid.UUID
	if userIdFromToken, err := helper.GetUserIdFromToken(request); err == nil {
		userId = &userIdFromToken
	}

	// Find job vacancy
	jobVacancyResponse := controller.JobVacancyService.FindById(request.Context(), jobVacancyId, userId)
	if jobVacancyResponse.TakenDownAt != nil {
		// Periksa apakah user adalah creator
		isCreator := false
		if jobVacancyResponse.CreatorId != nil && *jobVacancyResponse.CreatorId == userId.String() {
			isCreator = true
		}

		// Jika bukan creator, kembalikan not found
		if !isCreator {
			webResponse := web.WebResponse{
				Code:   404,
				Status: "NOT_FOUND",
				Data:   "Job vacancy not found",
			}
			helper.WriteToResponseBody(writer, webResponse)
			return
		}
	}
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindActiveJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get pagination parameters
	page := parseInt(request.URL.Query().Get("page"), 1)
	pageSize := parseInt(request.URL.Query().Get("pageSize"), 10)

	// Get user ID from context (optional for public endpoints)
	var userId *uuid.UUID
	if userIdFromToken, err := helper.GetUserIdFromToken(request); err == nil {
		userId = &userIdFromToken
	}

	// Find active job vacancies
	jobVacanciesResponse := controller.JobVacancyService.FindActiveJobs(request.Context(), page, pageSize, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) SearchJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (if available)
	var userId *uuid.UUID
	if userIdFromToken, err := helper.GetUserIdFromToken(request); err == nil {
		userId = &userIdFromToken
	}

	// Parse search request from query parameters
	searchRequest := web.JobVacancySearchRequest{
		Search:          request.URL.Query().Get("search"),
		Location:        request.URL.Query().Get("location"),
		JobType:         request.URL.Query().Get("job_type"),
		ExperienceLevel: request.URL.Query().Get("experience_level"),
		WorkType:        request.URL.Query().Get("work_type"),
		Page:            parseInt(request.URL.Query().Get("page"), 1),
		PageSize:        parseInt(request.URL.Query().Get("page_size"), 10),
	}

	// Parse optional salary filters
	if minSalaryStr := request.URL.Query().Get("min_salary"); minSalaryStr != "" {
		searchRequest.MinSalary = parseFloatPtr(minSalaryStr)
	}
	if maxSalaryStr := request.URL.Query().Get("max_salary"); maxSalaryStr != "" {
		searchRequest.MaxSalary = parseFloatPtr(maxSalaryStr)
	}

	// Parse array parameters
	if skillsStr := request.URL.Query().Get("skills"); skillsStr != "" {
		searchRequest.Skills = strings.Split(skillsStr, ",")
	}

	// Search job vacancies
	jobVacanciesResponse := controller.JobVacancyService.SearchJobs(request.Context(), searchRequest, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get company ID from path
	companyId, err := uuid.Parse(params.ByName("companyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid company ID"))
	}

	// Get pagination parameters
	page := parseInt(request.URL.Query().Get("page"), 1)
	pageSize := parseInt(request.URL.Query().Get("pageSize"), 10)

	// Get user ID from context (optional)
	var userId *uuid.UUID
	if userIdFromToken, err := helper.GetUserIdFromToken(request); err == nil {
		userId = &userIdFromToken
	}

	// Get status filter from query parameter
	status := request.URL.Query().Get("status")

	if status != "" {
		// Find job vacancies by company with status filter
		jobVacanciesResponse := controller.JobVacancyService.FindByCompanyIdWithStatus(request.Context(), companyId, status, page, pageSize, userId)

		webResponse := web.WebResponse{
			Code:   200,
			Status: "OK",
			Data:   jobVacanciesResponse,
		}

		helper.WriteToResponseBody(writer, webResponse)
	} else {
		// Find all job vacancies by company
		jobVacanciesResponse := controller.JobVacancyService.FindByCompanyId(request.Context(), companyId, page, pageSize, userId)

		webResponse := web.WebResponse{
			Code:   200,
			Status: "OK",
			Data:   jobVacanciesResponse,
		}

		helper.WriteToResponseBody(writer, webResponse)
	}
}

func (controller *JobVacancyControllerImpl) FindByCreatorId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	creatorId, err := uuid.Parse(params.ByName("creatorId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid creator ID"))
	}

	// Get pagination parameters
	page := parseInt(request.URL.Query().Get("page"), 1)
	pageSize := parseInt(request.URL.Query().Get("pageSize"), 10)

	// Get user ID from context (optional)
	var userId *uuid.UUID
	if userIdFromToken, err := helper.GetUserIdFromToken(request); err == nil {
		userId = &userIdFromToken
	}

	// Find job vacancies by creator
	jobVacanciesResponse := controller.JobVacancyService.FindByCreatorId(request.Context(), creatorId, page, pageSize, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get pagination parameters
	page := parseInt(request.URL.Query().Get("page"), 1)
	pageSize := parseInt(request.URL.Query().Get("pageSize"), 10)

	// Get user ID from context (optional)
	var userId *uuid.UUID
	if userIdFromToken, err := helper.GetUserIdFromToken(request); err == nil {
		userId = &userIdFromToken
	}

	// Find all job vacancies
	jobVacanciesResponse := controller.JobVacancyService.FindAll(request.Context(), page, pageSize, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) UpdateStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid or missing token"))
	}

	// Get job vacancy ID from path
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid job vacancy ID"))
	}

	// Parse request body
	var statusRequest struct {
		Status string `json:"status" validate:"required,oneof=draft active closed archived"`
	}
	helper.ReadFromRequestBody(request, &statusRequest)

	// Update status
	err = controller.JobVacancyService.UpdateStatus(request.Context(), jobVacancyId, statusRequest.Status, userId)
	if err != nil {
		panic(exception.NewInternalServerError("Failed to update job vacancy status"))
	}

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Job vacancy status updated successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) GetPublicJobDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, _ := helper.GetUserIdFromToken(request)

	// Get job vacancy ID from path
	jobVacancyId, err := uuid.Parse(params.ByName("vacancyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid job vacancy ID"))
	}

	// Get public job detail
	jobVacancyResponse := controller.JobVacancyService.GetPublicJobDetail(request.Context(), jobVacancyId, &userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// Helper functions
func parseFloatPtr(s string) *float64 {
	if s == "" {
		return nil
	}
	if f, err := strconv.ParseFloat(s, 64); err == nil {
		return &f
	}
	return nil
}

func parseStringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func parseInt(s string, defaultValue int) int {
	if s == "" {
		return defaultValue
	}
	if i, err := strconv.Atoi(s); err == nil {
		return i
	}
	return defaultValue
}
