// model/web/admin_report_web.go
package web

type AdminReportResponse struct {
    ID           string      `json:"id"`
    ReporterID   string      `json:"reporter_id"`
    ReporterName string      `json:"reporter_name,omitempty"`
    TargetType   string      `json:"target_type"`
    TargetID     string      `json:"target_id"`
    TargetInfo   TargetInfo  `json:"target_info"`
    Reason       string      `json:"reason"`
    Description  string      `json:"description,omitempty"`
    Status       string      `json:"status"`
    CreatedAt    string      `json:"created_at"`
}

type TargetInfo struct {
    Title       string `json:"title,omitempty"`
    Content     string `json:"content,omitempty"`
    Image       string `json:"image,omitempty"`
    Username    string `json:"username,omitempty"`
    Name        string `json:"name,omitempty"`
    Photo       string `json:"photo,omitempty"`
    AuthorName  string `json:"author_name,omitempty"`
    AuthorPhoto string `json:"author_photo,omitempty"`
}

type AdminReportListResponse struct {
    Reports     []AdminReportResponse `json:"reports"`
    TotalCount  int                   `json:"total_count"`
    CurrentPage int                   `json:"current_page"`
    TotalPages  int                   `json:"total_pages"`
}
