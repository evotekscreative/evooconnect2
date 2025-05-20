package controller

import (
    "context"
    "evoconnect/backend/helper"
    "evoconnect/backend/model/web"
    "evoconnect/backend/service"
    "fmt"
    "net/http"
    "encoding/json"
    "github.com/julienschmidt/httprouter"
)

type BlogController interface {
    Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    FindAll(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    Delete(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetBySlug(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) // Perbaiki signature
    UploadPhoto(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    GetRandomBlogs(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    CreateWithImage(w http.ResponseWriter, r *http.Request, params httprouter.Params) // Perbaiki signature

}

type BlogControllerImpl struct {
    BlogService service.BlogService
}

func NewBlogController(blogService service.BlogService) BlogController {
    return &BlogControllerImpl{BlogService: blogService}
}

func (c *BlogControllerImpl) Create(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

	// Parse multipart/form-data
	err := request.ParseMultipartForm(10 << 20) // 10MB max
	if err != nil {
		http.Error(writer, "Cannot parse multipart form", http.StatusBadRequest)
		return
	} 

	// Ambil form values
	blogCreateRequest := web.BlogCreateRequest{
		Title:    request.FormValue("title"),
		Category: request.FormValue("category"),
		Content:  request.FormValue("content"),
	}

	// Ambil user ID dari context
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

	// Validasi input
	if err := helper.ValidateBlogInput(blogCreateRequest.Title, blogCreateRequest.Content, blogCreateRequest.Category); err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Tangani file upload
	file, fileHeader, err := request.FormFile("image")
var savedPath string
if err == nil {
    defer file.Close()
    savedPath, err = helper.SaveBlogImage(file, fileHeader, userID) // Tambahkan userID
		if err != nil {
			webResponse := web.WebResponse{
				Code:   http.StatusInternalServerError,
				Status: "INTERNAL SERVER ERROR",
				Data:   err.Error(),
			}
			helper.WriteToResponseBody(writer, webResponse)
			return
		}
	}

	// Panggil service
	blogResponse, err := c.BlogService.CreateWithImagePath(request.Context(), blogCreateRequest, userID, savedPath)
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


func (c *BlogControllerImpl) Update(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
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

    // Ambil ID blog dari parameter URL
    blogID := params.ByName("blogId")

    // Parse multipart/form-data
    err := request.ParseMultipartForm(10 << 20) // 10MB max
    if err != nil {
        http.Error(writer, "Cannot parse multipart form", http.StatusBadRequest)
        return
    }

    // Ambil form values
    blogUpdateRequest := web.BlogCreateRequest{
        Title:    request.FormValue("title"),
        Category: request.FormValue("category"),
        Content:  request.FormValue("content"),
    }

    // Ambil user ID dari context
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

    // Validasi input
    if err := helper.ValidateBlogInput(blogUpdateRequest.Title, blogUpdateRequest.Content, blogUpdateRequest.Category); err != nil {
        webResponse := web.WebResponse{
            Code:   http.StatusBadRequest,
            Status: "BAD REQUEST",
            Data:   err.Error(),
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }

    // Dapatkan blog yang ada untuk mendapatkan path gambar lama
    existingBlog, err := c.BlogService.FindById(request.Context(), blogID)
    if err != nil {
        webResponse := web.WebResponse{
            Code:   http.StatusNotFound,
            Status: "NOT FOUND",
            Data:   "Blog tidak ditemukan",
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }

    // Tangani file upload jika ada
    var savedPath string
    file, fileHeader, err := request.FormFile("image")
if err == nil {
    defer file.Close()
    
    // Hapus gambar lama jika ada
    if existingBlog.Photo != "" {
        err = helper.DeleteBlogImage(existingBlog.Photo)
        if err != nil {
            fmt.Printf("Error deleting old image: %v\n", err)
        }
    }
    
    // Simpan gambar baru dengan userID
    savedPath, err = helper.SaveBlogImage(file, fileHeader, userID) // Tambahkan userID
        if err != nil {
            webResponse := web.WebResponse{
                Code:   http.StatusInternalServerError,
                Status: "INTERNAL SERVER ERROR",
                Data:   err.Error(),
            }
            helper.WriteToResponseBody(writer, webResponse)
            return
        }
    } else {
        // Jika tidak ada file baru, gunakan path gambar yang lama
        savedPath = existingBlog.Photo
    }

    // Panggil service untuk update blog
    blogResponse, err := c.BlogService.UpdateWithImagePath(request.Context(), blogID, blogUpdateRequest, userID, savedPath)
    if err != nil {
        webResponse := web.WebResponse{
            Code:   http.StatusBadRequest,
            Status: "BAD REQUEST",
            Data:   err.Error(),
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }

    // Kembalikan response
    webResponse := web.WebResponse{
        Code:   http.StatusOK,
        Status: "OK",
        Data:   blogResponse,
    }
    helper.WriteToResponseBody(writer, webResponse)
}


func (c *BlogControllerImpl) UploadPhoto(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    blogId := params.ByName("blogId")
    userId := request.Context().Value("user_id").(string) // Ambil user_id dari JWT middleware

    // Parse file dari form-data
    file, fileHeader, err := request.FormFile("photo")
    if err != nil {
        webResponse := web.WebResponse{
            Code:   http.StatusBadRequest,
            Status: "BAD REQUEST",
            Data:   "Gagal membaca file photo",
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }
    defer file.Close()

    // Panggil service untuk menyimpan file
    photoPath, err := c.BlogService.UploadPhoto(request.Context(), blogId, userId, file, fileHeader)
    if err != nil {
        webResponse := web.WebResponse{
            Code:   http.StatusInternalServerError,
            Status: "INTERNAL SERVER ERROR",
            Data:   err.Error(),
        }
        helper.WriteToResponseBody(writer, webResponse)
        return
    }

    // Kembalikan response
    webResponse := web.WebResponse{
        Code:   http.StatusOK,
        Status: "OK",
        Data: map[string]string{
            "photo": photoPath,
        },
    }
    helper.WriteToResponseBody(writer, webResponse)
}


func (c *BlogControllerImpl) GetRandomBlogs(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
    blogs, err := c.BlogService.GetRandomBlogs(request.Context(), 3) // Ambil 3 blog random
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
        Data:   blogs,
    }
    helper.WriteToResponseBody(writer, webResponse)
}

func (c *BlogControllerImpl) CreateWithImage(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	err := r.ParseMultipartForm(10 << 20) // Max 10MB
	if err != nil {
		http.Error(w, "Gagal parse form", http.StatusBadRequest)
		return
	}

	// Ambil data form
	title := r.FormValue("title")
	content := r.FormValue("content")
	category := r.FormValue("category")

	blogReq := web.BlogCreateRequest{
		Title:    title,
		Content:  content,
		Category: category,
	}

	// Ambil file gambar
	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Gagal ambil file gambar", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Simulasi user ID (misal dari header)
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "User ID kosong", http.StatusBadRequest)
		return
	}

	// Upload gambar
	imagePath, err := c.BlogService.UploadPhoto(r.Context(), "", userID, file, fileHeader)
	if err != nil {
		http.Error(w, "Upload gambar gagal", http.StatusInternalServerError)
		return
	}

	// Simpan blog
	response, err := c.BlogService.CreateWithImagePath(r.Context(), blogReq, userID, imagePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Kirim response JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


