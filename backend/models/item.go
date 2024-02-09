package models

type Item struct {
	ID          string `json:"id,omitempty"`
	UserID      string `json:"userId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
}
