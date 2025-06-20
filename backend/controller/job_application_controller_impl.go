package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type JobApplicationControllerImpl struct {
	JobApplicationService service.JobApplicationService
}

func NewJobApplicationController(jobApplicationService service.JobApplicationService) JobApplicationController {
	return &JobApplicationControllerImpl{
		JobApplicationService: jobApplicationService,
	}
}

func (controller *JobApplicationControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("vacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	jobApplicationCreateRequest := web.CreateJobApplicationRequest{}
	helper.ReadFromRequestBody(request, &jobApplicationCreateRequest)

	jobApplicationResponse := controller.JobApplicationService.Create(request.Context(), jobApplicationCreateRequest, jobVacancyId, userId)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	applicationIdParam := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	jobApplicationUpdateRequest := web.UpdateJobApplicationRequest{}
	helper.ReadFromRequestBody(request, &jobApplicationUpdateRequest)

	jobApplicationResponse := controller.JobApplicationService.Update(request.Context(), jobApplicationUpdateRequest, applicationId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	applicationIdParam := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	controller.JobApplicationService.Delete(request.Context(), applicationId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindById(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	applicationIdParam := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdParam)
	helper.PanicIfError(err)

	jobApplicationResponse := controller.JobApplicationService.FindById(request.Context(), applicationId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindByJobVacancy(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("vacancyId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
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

	jobApplicationResponse := controller.JobApplicationService.FindByJobVacancy(request.Context(), jobVacancyId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindMyApplications(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
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

	jobApplicationResponse := controller.JobApplicationService.FindByApplicant(request.Context(), userId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindByCompany(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	jobApplicationResponse := controller.JobApplicationService.FindByCompany(request.Context(), companyId, status, limit, offset)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) FindWithFilters(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobApplicationFilterRequest := web.JobApplicationFilterRequest{}
	helper.ReadFromRequestBody(request, &jobApplicationFilterRequest)

	// Set default values
	if jobApplicationFilterRequest.Limit == 0 {
		jobApplicationFilterRequest.Limit = 10
	}

	jobApplicationResponse := controller.JobApplicationService.FindWithFilters(request.Context(), jobApplicationFilterRequest)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) ReviewApplication(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	applicationIdParam := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	reviewRequest := web.ReviewJobApplicationRequest{}
	helper.ReadFromRequestBody(request, &reviewRequest)

	jobApplicationResponse := controller.JobApplicationService.ReviewApplication(request.Context(), reviewRequest, applicationId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) UploadCV(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	applicationIdParam := params.ByName("applicationId")
	applicationId, err := uuid.Parse(applicationIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	// Parse multipart form
	err = request.ParseMultipartForm(10 << 20) // 10 MB max
	helper.PanicIfError(err)

	file, fileHeader, err := request.FormFile("cv")
	helper.PanicIfError(err)
	defer file.Close()

	fileExt := fileHeader.Filename[strings.LastIndex(fileHeader.Filename, ".")+1:]
	if fileExt != "pdf" && fileExt != "docx" && fileExt != "txt" {
		helper.PanicIfError(helper.NewBadRequestError("Invalid file type. Only PDF, DOCX, and TXT are allowed."))
	}

	// Save file using helper
	filePath := helper.SaveUploadedFile(file, "cv", userId.String(), fileExt)

	jobApplicationResponse := controller.JobApplicationService.UploadCV(request.Context(), applicationId, userId, filePath)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   jobApplicationResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) GetStats(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	var companyId *uuid.UUID
	companyIdParam := request.URL.Query().Get("company_id")
	if companyIdParam != "" {
		id, err := uuid.Parse(companyIdParam)
		helper.PanicIfError(err)
		companyId = &id
	}

	statsResponse := controller.JobApplicationService.GetStats(request.Context(), companyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   statsResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *JobApplicationControllerImpl) CheckApplicationStatus(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	jobVacancyIdParam := params.ByName("applicationId")
	jobVacancyId, err := uuid.Parse(jobVacancyIdParam)
	helper.PanicIfError(err)

	// Get user from context
	userId, err := helper.GetUserIdFromToken(request)
	helper.PanicIfError(err)

	hasApplied := controller.JobApplicationService.HasApplied(request.Context(), jobVacancyId, userId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data: map[string]bool{
			"has_applied": hasApplied,
		},
	}

	helper.WriteToResponseBody(writer, webResponse)
}
