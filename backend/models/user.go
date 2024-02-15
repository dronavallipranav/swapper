package models

type User struct {
	ID             string `json:"id,omitempty"`
	Name           string `json:"name", validate:"required"`
	Email          string `json:"email", validate:"required,email"`
	PasswordHash   string `json:"password_hash", validate:"required"`
	ProfilePicture string `json:"profilePicture"`
}
