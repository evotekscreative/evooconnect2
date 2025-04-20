package exception

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
)

func ErrorHandler(writer http.ResponseWriter, request *http.Request, err interface{}) {

	if notFoundError(writer, request, err) {
		return
	}

	if validationErrors(writer, request, err) {
		return
	}

	if badRequestError(writer, request, err) {
		return
	}

	if unauthorizedError(writer, request, err) {
		return
	}

	if tooManyRequestsError(writer, request, err) {
		return
	}

	if internalServerError(writer, request, err) {
		return
	}
}

func unauthorizedError(writer http.ResponseWriter, request *http.Request, err interface{}) bool {
	exception, ok := err.(UnauthorizedError)
	if ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)

		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   exception.Error,
		}

		helper.WriteToResponseBody(writer, webResponse)
		return true
	} else {
		return false
	}
}

func validationErrors(writer http.ResponseWriter, request *http.Request, err interface{}) bool {
	exception, ok := err.(validator.ValidationErrors)
	if ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusBadRequest)

		// Buat map untuk menyimpan pesan error per field
		errors := make(map[string]string)
		for _, fieldError := range exception {
			// Sesuaikan pesan error berdasarkan tag validasi
			switch fieldError.Tag() {
			case "required":
				errors[fieldError.Field()] = "field is required"
			case "email":
				errors[fieldError.Field()] = "must be a valid email address"
			case "min":
				errors[fieldError.Field()] = fmt.Sprintf("minimum value is %s", fieldError.Param())
			case "max":
				errors[fieldError.Field()] = fmt.Sprintf("maximum value is %s", fieldError.Param())
			case "len":
				errors[fieldError.Field()] = fmt.Sprintf("length must be %s", fieldError.Param())
			default:
				errors[fieldError.Field()] = "invalid value"
			}
		}

		// Buat respons dengan format yang diinginkan
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   errors,
		}

		helper.WriteToResponseBody(writer, webResponse)
		return true
	} else {
		return false
	}
}

func notFoundError(writer http.ResponseWriter, request *http.Request, err interface{}) bool {
	exception, ok := err.(NotFoundError)
	if ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusNotFound)

		webResponse := web.WebResponse{
			Code:   http.StatusNotFound,
			Status: "NOT FOUND",
			Data:   exception.Error,
		}

		helper.WriteToResponseBody(writer, webResponse)
		return true
	} else {
		return false
	}
}

func internalServerError(writer http.ResponseWriter, request *http.Request, err interface{}) bool {
	exception, ok := err.(InternalServerError)
	if ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusInternalServerError)

		webResponse := web.WebResponse{
			Code:   http.StatusInternalServerError,
			Status: "INTERNAL SERVER ERROR",
			Data:   exception.Error,
		}

		helper.WriteToResponseBody(writer, webResponse)
		return true
	} else {
		return false
	}
}

func badRequestError(writer http.ResponseWriter, request *http.Request, err interface{}) bool {
	exception, ok := err.(BadRequestError)
	if ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusBadRequest)

		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   exception.Error,
		}

		helper.WriteToResponseBody(writer, webResponse)
		return true
	} else {
		return false
	}
}

func tooManyRequestsError(writer http.ResponseWriter, request *http.Request, err interface{}) bool {
	exception, ok := err.(TooManyRequestsError)
	if ok {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusTooManyRequests)

		webResponse := web.WebResponse{
			Code:   http.StatusTooManyRequests,
			Status: "TOO_MANY_REQUESTS",
			Data:   exception.Error,
		}

		helper.WriteToResponseBody(writer, webResponse)
		return true
	} else {
		return false
	}
}
