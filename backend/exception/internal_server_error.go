package exception

import "net/http"

type InternalServerError struct {
	Error string
}

func NewInternalServerError(error string) InternalServerError {
	return InternalServerError{Error: error}
}

func (e InternalServerError) GetError() string {
	return e.Error
}

func (e InternalServerError) GetStatus() int {
	return http.StatusInternalServerError
}
