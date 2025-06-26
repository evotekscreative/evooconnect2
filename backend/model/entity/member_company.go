package entity

import (
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"time"

	"github.com/google/uuid"
)

type MemberCompanyRole string
type MemberCompanyStatus string

const (
	// Member Company Roles
	RoleSuperAdmin MemberCompanyRole = "super_admin"
	RoleAdmin      MemberCompanyRole = "admin"
	RoleHRD        MemberCompanyRole = "hrd"
	RoleMember     MemberCompanyRole = "member"

	// Member Company Status
	StatusActive   MemberCompanyStatus = "active"
	StatusInactive MemberCompanyStatus = "inactive"
)

type MemberCompany struct {
	ID         uuid.UUID           `db:"id" json:"id"`
	UserID     uuid.UUID           `db:"user_id" json:"user_id"`
	CompanyID  uuid.UUID           `db:"company_id" json:"company_id"`
	Role       MemberCompanyRole   `db:"role" json:"role"`
	Status     MemberCompanyStatus `db:"status" json:"status"`
	JoinedAt   time.Time           `db:"joined_at" json:"joined_at"`
	LeftAt     *time.Time          `db:"left_at" json:"left_at,omitempty"`
	ApprovedBy *string             `db:"approved_by" json:"approved_by,omitempty"`
	ApprovedAt *time.Time          `db:"approved_at" json:"approved_at,omitempty"`
	CreatedAt  time.Time           `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time           `db:"updated_at" json:"updated_at"`

	// Relations
	User     *domain.User    `json:"user,omitempty"`
	Company  *domain.Company `json:"company,omitempty"`
	Approver *domain.Admin   `json:"approver,omitempty"`
}

// Request DTOs
type CreateMemberCompanyRequest struct {
	UserID    uuid.UUID         `json:"user_id" validate:"required,uuid4"`
	CompanyID uuid.UUID         `json:"company_id" validate:"required,uuid4"`
	Role      MemberCompanyRole `json:"role" validate:"required,oneof=super_admin admin hrd member"`
}

type UpdateMemberCompanyRoleRequest struct {
	Role MemberCompanyRole `json:"role" validate:"required,oneof=super_admin admin hrd member"`
}

type UpdateMemberCompanyStatusRequest struct {
	Status MemberCompanyStatus `json:"status" validate:"required,oneof=active inactive"`
}

// Response DTOs
type MemberCompanyResponse struct {
	ID         uuid.UUID            `json:"id"`
	UserID     uuid.UUID            `json:"user_id"`
	CompanyID  uuid.UUID            `json:"company_id"`
	Role       MemberCompanyRole    `json:"role"`
	Status     MemberCompanyStatus  `json:"status"`
	JoinedAt   time.Time            `json:"joined_at"`
	LeftAt     *time.Time           `json:"left_at,omitempty"`
	ApprovedBy *string              `json:"approved_by,omitempty"`
	ApprovedAt *time.Time           `json:"approved_at,omitempty"`
	CreatedAt  time.Time            `json:"created_at"`
	UpdatedAt  time.Time            `json:"updated_at"`
	User       *web.UserMinimal     `json:"user,omitempty"`
	Company    *web.CompanyResponse `json:"company,omitempty"`
}

type MemberCompanyListResponse struct {
	Members []MemberCompanyResponse `json:"members"`
	Total   int                     `json:"total"`
}
