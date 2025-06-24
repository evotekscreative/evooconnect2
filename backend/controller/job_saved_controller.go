package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type SavedJobController interface {
	SaveJob(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	UnsaveJob(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	FindSavedJobs(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	IsJobSaved(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
