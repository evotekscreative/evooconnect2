package controller

import (
	"encoding/json"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type ReportControllerImpl struct {
	reportService service.ReportService
}

// NewReportController membuat instance baru dari ReportControllerImpl
func NewReportController(service service.ReportService) ReportController {
	return &ReportControllerImpl{
		reportService: service,
	}
}

// CreateReportHandler menangani permintaan pembuatan laporan
func (c *ReportControllerImpl) CreateReportHandler() httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		var request web.CreateReportRequest
		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			helper.WriteJSON(w, http.StatusBadRequest, web.APIResponse{
				Code:   http.StatusBadRequest,
				Status: "BAD_REQUEST",
				Error:  "Body tidak valid",
			})
			return
		}

		// Ambil dari path
		request.ReporterID = ps.ByName("userId")
		request.TargetType = ps.ByName("targetType")
		request.TargetID = ps.ByName("targetId")

		// Proses pembuatan laporan
		result, err := c.reportService.Create(request)
		if err != nil {
			status := http.StatusInternalServerError
			msg := err.Error()

			// Penyesuaian status berdasarkan error
			switch msg {
			case "you have already reported this content":
				status = http.StatusConflict
			case "invalid report reason", "other reason must be filled":
				status = http.StatusBadRequest
			}

			helper.WriteJSON(w, status, web.APIResponse{
				Code:   status,
				Status: http.StatusText(status),
				Error:  msg,
			})
			return
		}

		// Response sukses
		helper.WriteJSON(w, http.StatusCreated, web.APIResponse{
			Code:   http.StatusCreated,
			Status: "CREATED",
			Data:   result,
		})
	}
}
