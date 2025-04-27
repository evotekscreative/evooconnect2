package controller

import (
    "context"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/web"
    "evoconnect/backend/service"
    "fmt"
    "net/http"
    "github.com/julienschmidt/httprouter"
)

type BlogController interface {
    Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetBySlug(writer http.ResponseWriter, request *http.Request, params httprouter.Params)

}

type BlogControllerImpl struct {
    BlogService service.BlogService
}

func NewBlogController(blogService service.BlogService) BlogController {
    return &BlogControllerImpl{BlogService: blogService}
}

func (c *BlogControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	blogCreateRequest := web.BlogCreateRequest{}
	defer func() {
		if r := recover(); r != nil {
			webResponse := web.WebResponse{
				Code:   http.StatusBadRequest,
				Status: "BAD REQUEST",
				Data:   fmt.Sprintf("%v", r),
			}
			helper.WriteToResponseBody(writer, webResponse)
		}
	}()

	// Read the request body
	helper.ReadFromRequestBody(request, &blogCreateRequest)

	// Extract userID from context (JWT claims)
	userIDVal := request.Context().Value("user_id")
	if userIDVal == nil {
		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "User ID not found in context",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	var userID string
	switch v := userIDVal.(type) {
	case float64:
		userID = fmt.Sprintf("%.0f", v)
	case int:
		userID = fmt.Sprintf("%d", v)
	case string:
		userID = v
	default:
		webResponse := web.WebResponse{
			Code:   http.StatusUnauthorized,
			Status: "UNAUTHORIZED",
			Data:   "Invalid user ID type in context",
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Call the service to create the blog
	blogResponse := c.BlogService.Create(request.Context(), blogCreateRequest, userID)

	webResponse := web.WebResponse{
		Code:   http.StatusCreated,
		Status: "CREATED",
		Data:   blogResponse,
	}
	helper.WriteToResponseBody(writer, webResponse)
}


func (c *BlogControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    blogs, err := c.BlogService.FindAll(context.Background())
    if err != nil {
        webResponse := web.WebResponse{
            Code:   http.StatusInternalServerError,
            Status: "INTERNAL SERVER ERROR",
            Data:   err.Error(),
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }

    helper.WriteToResponseBody(writer, blogs)
}

func (c *BlogControllerImpl) Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    blogID := params.ByName("blogId")

    err := c.BlogService.Delete(request.Context(), blogID)
    if err != nil {
        webResponse := web.WebResponse{
            Code:   http.StatusInternalServerError,
            Status: "INTERNAL SERVER ERROR",
            Data:   err.Error(),
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }

    webResponse := web.WebResponse{
        Code:   http.StatusOK,
        Status: "OK",
        Data:   map[string]string{"message": "Blog berhasil dihapus"},
    }
    helper.WriteToResponseBody(writer, webResponse)
}

func (c *BlogControllerImpl) GetBySlug(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    // Ambil slug dari parameter URL
    slug := params.ByName("slug")

    // Panggil service untuk mendapatkan blog berdasarkan slug
    blog, err := c.BlogService.FindBySlug(request.Context(), slug)
    if err != nil {
        // Jika terjadi error, tangani sesuai jenis error
        webResponse := web.WebResponse{
            Code:   http.StatusNotFound,
            Status: "NOT FOUND",
            Data:   err.Error(),
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }

    // Jika berhasil, kembalikan response dengan data blog
    webResponse := web.WebResponse{
        Code:   http.StatusOK,
        Status: "OK",
        Data:   blog,
    }
    helper.WriteToResponseBody(writer, webResponse)
}




