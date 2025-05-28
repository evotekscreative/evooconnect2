package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
	"fmt"
)


type SearchControllerImpl struct {
	SearchService service.SearchService
}

func NewSearchController(searchService service.SearchService) SearchController {
	return &SearchControllerImpl{
		SearchService: searchService,
	}
}

func (controller *SearchControllerImpl) Search(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Get user ID from context
    userIdStr, ok := request.Context().Value("user_id").(string)
    if !ok {
        helper.WriteToResponseBody(writer, web.WebResponse{
            Code:   401,
            Status: "UNAUTHORIZED",
            Data:   "Unauthorized access",
        })
        return
    }
    
    userId, err := uuid.Parse(userIdStr)
    if err != nil {
        helper.WriteToResponseBody(writer, web.WebResponse{
            Code:   400,
            Status: "BAD REQUEST",
            Data:   "Invalid user ID",
        })
        return
    }

    // Get query parameters
    query := request.URL.Query().Get("q")
    
    // Tambahkan log untuk debugging
    fmt.Printf("Search query: %s\n", query)
    
    if query == "" {
        helper.WriteToResponseBody(writer, web.WebResponse{
            Code:   400,
            Status: "BAD REQUEST",
            Data:   "Search query is required",
        })
        return
    }
    
    searchType := request.URL.Query().Get("type")
    if searchType == "" {
        searchType = "all"
    }

    limitStr := request.URL.Query().Get("limit")
    limit := 10 // Default limit
    if limitStr != "" {
        parsedLimit, err := strconv.Atoi(limitStr)
        if err == nil && parsedLimit > 0 {
            limit = parsedLimit
        }
    }

    offsetStr := request.URL.Query().Get("offset")
    offset := 0 // Default offset
    if offsetStr != "" {
        parsedOffset, err := strconv.Atoi(offsetStr)
        if err == nil && parsedOffset >= 0 {
            offset = parsedOffset
        }
    }

    // Perform search
    searchResponse := controller.SearchService.Search(request.Context(), query, searchType, limit, offset, userId)
    
    // Log hasil pencarian untuk debugging
    fmt.Printf("Search results: %+v\n", searchResponse)

    // Return response
    webResponse := web.WebResponse{
        Code:   200,
        Status: "OK",
        Data:   searchResponse,
    }

    helper.WriteToResponseBody(writer, webResponse)
}
