package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	// "fmt"
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
	companyIdParam := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	createRequest := web.CreateJobVacancyRequest{}
	helper.ReadFromRequestBody(request, &createRequest)

	jobVacancyResponse := controller.JobVacancyService.Create(request.Context(), createRequest, companyId, userId)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("vacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	updateRequest := web.UpdateJobVacancyRequest{}
	helper.ReadFromRequestBody(request, &updateRequest)

	jobVacancyResponse := controller.JobVacancyService.Update(request.Context(), updateRequest, jobVacancyId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("vacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userContext := request.Context().Value("user").(map[string]interface{})
	userId, err := uuid.Parse(userContext["id"].(string))
	helper.PanicIfError(err)

	controller.JobVacancyService.Delete(request.Context(), jobVacancyId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("vacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
	helper.PanicIfError(err)

	jobVacancyResponse := controller.JobVacancyService.FindById(request.Context(), jobVacancyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindByCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	companyIdParam := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdParam)
	helper.PanicIfError(err)

	// Get query parameters
	status := request.URL.Query().Get("status")
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		helper.PanicIfError(err)
	}

	offset := 0
	if offsetStr != "" {
		offset, err = strconv.Atoi(offsetStr)
		helper.PanicIfError(err)
	}

	jobVacancyResponse := controller.JobVacancyService.FindByCompany(request.Context(), companyId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindMyJobVacancies(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user from context
	userContext := request.Context().Value("user").(map[string]interface{})
	userId, err := uuid.Parse(userContext["id"].(string))
	helper.PanicIfError(err)

	// Get query parameters
	limitStr := request.URL.Query().Get("limit")
	offsetStr := request.URL.Query().Get("offset")

	limit := 10
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		helper.PanicIfError(err)
	}

	offset := 0
	if offsetStr != "" {
		offset, err = strconv.Atoi(offsetStr)
		helper.PanicIfError(err)
	}

	jobVacancyResponse := controller.JobVacancyService.FindByCreator(request.Context(), userId, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindWithFilters(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	filterRequest := web.JobVacancyFilterRequest{}
	helper.ReadFromParams(request, &filterRequest)

	// Set default values
	if filterRequest.Limit == 0 {
		filterRequest.Limit = 10
	}

	jobVacancyResponse := controller.JobVacancyService.FindWithFilters(request.Context(), filterRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) FindPublicJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse query parameters
	searchRequest := web.PublicJobSearchRequest{
		JobType:         request.URL.Query().Get("job_type"),
		ExperienceLevel: request.URL.Query().Get("experience_level"),
		Location:        request.URL.Query().Get("location"),
		Search:          request.URL.Query().Get("search"),
		Industry:        request.URL.Query().Get("industry"),
		SortBy:          request.URL.Query().Get("sort_by"),
		SortOrder:       request.URL.Query().Get("sort_order"),
	}

	// Parse company_id if provided
	if companyIdStr := request.URL.Query().Get("company_id"); companyIdStr != "" {
		companyId, err := uuid.Parse(companyIdStr)
		if err == nil {
			searchRequest.CompanyId = &companyId
		}
	}

	// Parse boolean fields
	if remoteWorkStr := request.URL.Query().Get("remote_work"); remoteWorkStr != "" {
		remoteWork := remoteWorkStr == "true"
		searchRequest.RemoteWork = &remoteWork
	}

	if isUrgentStr := request.URL.Query().Get("is_urgent"); isUrgentStr != "" {
		isUrgent := isUrgentStr == "true"
		searchRequest.IsUrgent = &isUrgent
	}

	// Parse numeric fields
	if salaryMinStr := request.URL.Query().Get("salary_min"); salaryMinStr != "" {
		if salaryMin, err := strconv.ParseFloat(salaryMinStr, 64); err == nil {
			searchRequest.SalaryMin = &salaryMin
		}
	}

	if salaryMaxStr := request.URL.Query().Get("salary_max"); salaryMaxStr != "" {
		if salaryMax, err := strconv.ParseFloat(salaryMaxStr, 64); err == nil {
			searchRequest.SalaryMax = &salaryMax
		}
	}

	if postedWithinStr := request.URL.Query().Get("posted_within"); postedWithinStr != "" {
		if postedWithin, err := strconv.Atoi(postedWithinStr); err == nil {
			searchRequest.PostedWithin = postedWithin
		}
	}

	// Parse pagination
	searchRequest.Limit = 20 // Default
	if limitStr := request.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			searchRequest.Limit = limit
		}
	}

	if offsetStr := request.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			searchRequest.Offset = offset
		}
	}

	// Set default sort
	if searchRequest.SortBy == "" {
		searchRequest.SortBy = "date"
	}
	if searchRequest.SortOrder == "" {
		searchRequest.SortOrder = "desc"
	}

	jobVacancyResponse := controller.JobVacancyService.FindPublicJobs(request.Context(), searchRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) UpdateStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("vacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	statusRequest := web.UpdateJobStatusRequest{}
	helper.ReadFromRequestBody(request, &statusRequest)

	jobVacancyResponse := controller.JobVacancyService.UpdateStatus(request.Context(), jobVacancyId, statusRequest.Status, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobVacancyResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) IncrementView(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("vacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
	helper.PanicIfError(err)

	controller.JobVacancyService.IncrementViewCount(request.Context(), jobVacancyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) GetStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	var companyId *uuid.UUID
	companyIdParam := request.URL.Query().Get("company_id")
	if companyIdParam != "" {
		id, err := uuid.Parse(companyIdParam)
		helper.PanicIfError(err)
		companyId = &id
	}

	statsResponse := controller.JobVacancyService.GetStats(request.Context(), companyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   statsResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobVacancyControllerImpl) GetCompanyStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	companyIdParam := params.ByName("companyId")
	companyId, err := uuid.Parse(companyIdParam)
	helper.PanicIfError(err)

	statsResponse := controller.JobVacancyService.GetCompanyJobStats(request.Context(), companyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   statsResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
