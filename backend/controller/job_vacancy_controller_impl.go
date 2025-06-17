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

	// Parse request body
	var createRequest web.CreateJobVacancyRequest
	helper.ReadFromRequestBody(request, &createRequest)

	// Set company ID from path parameter if not provided in body
	if companyIdParam := params.ByName("companyId"); companyIdParam != "" {
		companyId, err := uuid.Parse(companyIdParam)
		if err != nil {
			panic(exception.NewBadRequestError("Invalid company ID"))
		}
		createRequest.CompanyId = companyId
	}

	// Create job vacancy
	jobVacancyResponse := controller.JobVacancyService.Create(request.Context(), createRequest, userId)

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
	companyId, err := uuid.Parse(params.ByName("companyId"))
	if err != nil {
		panic(exception.NewBadRequestError("Invalid company ID"))
	}

	// Get pagination parameters
	page, pageSize, err := helper.GetPaginationParams(request)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid pagination parameters"))
	}

	// Convert offset to page number
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}

	// Find job vacancies by company
	jobVacanciesResponse := controller.JobVacancyService.FindByCompanyId(request.Context(), companyId, page, pageSize)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindByCreatorId(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid or missing token"))
	}

	// Get pagination parameters
	page, pageSize, err := helper.GetPaginationParams(request)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid pagination parameters"))
	}

	// Convert offset to page number
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}

	// Find job vacancies by creator
	jobVacanciesResponse := controller.JobVacancyService.FindByCreatorId(request.Context(), userId, page, pageSize)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get pagination parameters
	page, pageSize, err := helper.GetPaginationParams(request)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid pagination parameters"))
	}

	// Convert offset to page number
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}

	// Find all job vacancies
	jobVacanciesResponse := controller.JobVacancyService.FindAll(request.Context(), page, pageSize)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindActiveJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get pagination parameters
	page, pageSize, err := helper.GetPaginationParams(request)
	if err != nil {
		panic(exception.NewBadRequestError("Invalid pagination parameters"))
	}

	// Convert offset to page number
	if page == 0 {
		page = 1
	}
	if pageSize == 0 {
		pageSize = 10
	}

	// Find active job vacancies
	jobVacanciesResponse := controller.JobVacancyService.FindActiveJobs(request.Context(), page, pageSize)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacanciesResponse,
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
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
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
