package controller

import "github.com/julienschmidt/httprouter"

type ReportController interface {
	CreateReportHandler() httprouter.Handle
}