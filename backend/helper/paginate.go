package helper

import (
	"fmt"
	"net/http"
	"strconv"
)

func GetPaginationParams(request *http.Request) (int, int, error) {
	limit := 10 // Default limit
	offset := 0 // Default offset

	limitParam := request.URL.Query().Get("limit")
	if limitParam != "" {
		var err error
		limit, err = strconv.Atoi(limitParam)
		if err != nil || limit <= 0 {
			return 0, 0, fmt.Errorf("invalid limit parameter")
		}
	}

	offsetParam := request.URL.Query().Get("offset")
	if offsetParam != "" {
		var err error
		offset, err = strconv.Atoi(offsetParam)
		if err != nil || offset < 0 {
			return 0, 0, fmt.Errorf("invalid offset parameter")
		}
	}

	return limit, offset, nil
}
