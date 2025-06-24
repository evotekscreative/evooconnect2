package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

type SavedJobControllerImpl struct {
	SavedJobService service.SavedJobService
}

func NewSavedJobController(savedJobService service.SavedJobService) SavedJobController {
	return &SavedJobControllerImpl{
		SavedJobService: savedJobService,
	}
}

func (controller *SavedJobControllerImpl) SaveJob(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context (set by auth middleware)
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(err)
	}

	// Get job vacancy ID from path parameter
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	if err != nil {
		panic(err)
	}

	// Save job
	savedJobResponse := controller.SavedJobService.SaveJob(request.Context(), userId, jobVacancyId)

	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   savedJobResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *SavedJobControllerImpl) UnsaveJob(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(err)
	}

	// Get job vacancy ID from path parameter
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	if err != nil {
		panic(err)
	}

	// Unsave job
	err = controller.SavedJobService.UnsaveJob(request.Context(), userId, jobVacancyId)
	if err != nil {
		panic(err)
	}

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   "Job unsaved successfully",
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *SavedJobControllerImpl) FindSavedJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(err)
	}

	// Get pagination parameters
	pageStr := request.URL.Query().Get("page")
	pageSizeStr := request.URL.Query().Get("pageSize")

	page := 1
	pageSize := 10

	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if pageSizeStr != "" {
		pageSize, _ = strconv.Atoi(pageSizeStr)
	}

	// Find saved jobs
	savedJobsResponse := controller.SavedJobService.FindSavedJobs(request.Context(), userId, page, pageSize)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   savedJobsResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *SavedJobControllerImpl) IsJobSaved(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Get user ID from context
	userId, err := helper.GetUserIdFromToken(request)
	if err != nil {
		panic(err)
	}

	// Get job vacancy ID from path parameter
	jobVacancyId, err := uuid.Parse(params.ByName("jobVacancyId"))
	if err != nil {
		panic(err)
	}

	// Check if job is saved
	isSaved := controller.SavedJobService.IsJobSaved(request.Context(), userId, jobVacancyId)

	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   map[string]bool{"is_saved": isSaved},
	}

	helper.WriteToResponseBody(writer, webResponse)
}
