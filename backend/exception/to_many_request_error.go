package exception

type TooManyRequestsError struct {
	Error string
}

func NewTooManyRequestsError(error string) TooManyRequestsError {
	return TooManyRequestsError{Error: error}
}

func (e TooManyRequestsError) GetError() string {
	return e.Error
}
