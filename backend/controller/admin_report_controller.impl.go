package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"
	"strconv"
	"encoding/json"
	"github.com/julienschmidt/httprouter"
)

type AdminReportControllerImpl struct {
	ReportService service.ReportService
}

func NewAdminReportController(reportService service.ReportService) AdminReportController {
	return &AdminReportControllerImpl{
		ReportService: reportService,
	}
}

func (controller *AdminReportControllerImpl) GetAllReports(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse query parameters
	pageStr := request.URL.Query().Get("page")
	limitStr := request.URL.Query().Get("limit")
	targetType := request.URL.Query().Get("target_type")
	
	page := 1
	limit := 10
	
	if pageStr != "" {
		pageVal, err := strconv.Atoi(pageStr)
		if err == nil && pageVal > 0 {
			page = pageVal
		}
	}
	
	if limitStr != "" {
		limitVal, err := strconv.Atoi(limitStr)
		if err == nil && limitVal > 0 {
			limit = limitVal
		}
	}
	
	// Panggil service untuk mendapatkan laporan
	reports, totalCount, err := controller.ReportService.FindAll(request.Context(), page, limit, targetType)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   500,
			Status: "INTERNAL_SERVER_ERROR",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}
	
	// Hitung total halaman
	totalPages := (totalCount + limit - 1) / limit
	
	// Buat response
	response := map[string]interface{}{
		"reports":      reports,
		"total_count":  totalCount,
		"current_page": page,
		"total_pages":  totalPages,
	}
	
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}
	
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AdminReportControllerImpl) GetReportDetail(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	reportId := params.ByName("reportId")
	
	// Panggil service untuk mendapatkan detail laporan
	report, err := controller.ReportService.FindById(request.Context(), reportId)
	if err != nil {
		status := 500
		message := err.Error()
		
		if message == "sql: no rows in result set" {
			status = 404
			message = "Report not found"
		}
		
		webResponse := web.WebResponse{
			Code:   status,
			Status: http.StatusText(status),
			Data:   message,
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}
	
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   report,
	}
	
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AdminReportControllerImpl) TakeAction(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	reportId := params.ByName("reportId")
	
	// Parse request body
	var actionRequest web.AdminActionRequest
	err := json.NewDecoder(request.Body).Decode(&actionRequest)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   400,
			Status: "BAD_REQUEST",
			Data:   "Invalid request body",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}
	
	// Panggil service untuk mengambil tindakan
	result, err := controller.ReportService.TakeAction(request.Context(), reportId, actionRequest)
	if err != nil {
		status := 500
		message := err.Error()
		
		if message == "sql: no rows in result set" {
			status = 404
			message = "Report not found"
		} else if message == "suspension duration must be greater than 0" {
			status = 400
		}
		
		webResponse := web.WebResponse{
			Code:   status,
			Status: http.StatusText(status),
			Data:   message,
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}
	
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   result,
	}
	
	helper.WriteToResponseBody(writer, webResponse)
}