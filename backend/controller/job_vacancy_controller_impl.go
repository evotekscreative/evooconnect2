package controller

import (
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"

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
	// Get job vacancy ID from path
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid job vacancy ID"))
	}

	// Find job vacancy
	jobVacancyResponse := controller.JobVacancyService.FindById(request.Context(), jobVacancyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindByCompanyId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get company ID from path
	companyIdStr := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdStr)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   400,
			Status: "BAD REQUEST",
			Data:   "Invalid company ID format",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Get pagination parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")
	statusFilter := request.URL.Query().Get("status")

	limit := 10 // default
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	offset := 0 // default
	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	// Convert offset to page number
	page := (offset / limit) + 1

	// Map API status to database status
	var dbStatus string
	switch statusFilter {
	case "published":
		dbStatus = "active"
	case "draft":
		dbStatus = "draft"
	case "closed":
		dbStatus = "closed"
	case "archived":
		dbStatus = "archived"
	default:
		dbStatus = "" // No filter
	}

	// Find job vacancies by company with status filter
	var jobVacancyResponse web.JobVacancyListResponse
	if dbStatus != "" {
		jobVacancyResponse = controller.JobVacancyService.FindByCompanyIdWithStatus(request.Context(), companyId, dbStatus, page, limit)
	} else {
		jobVacancyResponse = controller.JobVacancyService.FindByCompanyId(request.Context(), companyId, page, limit)
	}

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindByCreatorId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid or missing token"))
	}

	// Get pagination parameters
	limitStr := request.URL.Query().Get("limit")
	pageStr := request.URL.Query().Get("page")

	limit := 10 // default
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	page := 1 // default
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	// Find job vacancies by creator
	jobVacancyResponse := controller.JobVacancyService.FindByCreatorId(request.Context(), userId, page, limit)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get pagination parameters
	limitStr := request.URL.Query().Get("limit")
	pageStr := request.URL.Query().Get("page")

	limit := 10 // default
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	page := 1 // default
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	// Find all job vacancies
	jobVacancyResponse := controller.JobVacancyService.FindAll(request.Context(), page, limit)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindActiveJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get pagination parameters
	limitStr := request.URL.Query().Get("limit")
	pageStr := request.URL.Query().Get("page")

	limit := 10 // default
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	page := 1 // default
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	// Find active job vacancies
	jobVacancyResponse := controller.JobVacancyService.FindActiveJobs(request.Context(), page, limit)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) SearchJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse search request from query parameters
	searchRequest := web.JobVacancySearchRequest{
		Query:     request.URL.Query().Get("query"),
		Location:  request.URL.Query().Get("location"),
		MinSalary: parseFloatPtr(request.URL.Query().Get("min_salary")),
		MaxSalary: parseFloatPtr(request.URL.Query().Get("max_salary")),
		CompanyId: parseStringPtr(request.URL.Query().Get("company_id")),
		Page:      parseInt(request.URL.Query().Get("page"), 1),
		PageSize:  parseInt(request.URL.Query().Get("page_size"), 10),
	}

	// Parse array parameters
	if jobTypes := request.URL.Query()["job_type"]; len(jobTypes) > 0 {
		searchRequest.JobType = jobTypes
	}
	if experienceLevels := request.URL.Query()["experience_level"]; len(experienceLevels) > 0 {
		searchRequest.ExperienceLevel = experienceLevels
	}
	if workTypes := request.URL.Query()["work_type"]; len(workTypes) > 0 {
		searchRequest.WorkType = workTypes
	}
	if skills := request.URL.Query()["skills"]; len(skills) > 0 {
		searchRequest.Skills = skills
	}

	// Search job vacancies
	jobVacanciesResponse := controller.JobVacancyService.SearchJobs(request.Context(), searchRequest)

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
	// Get job vacancy ID from path
	jobVacancyId, err := uuid.Parse(params.ByName("vacancyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid job vacancy ID"))
	}

	// Get public job detail
	jobVacancyResponse := controller.JobVacancyService.GetPublicJobDetail(request.Context(), jobVacancyId)

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
