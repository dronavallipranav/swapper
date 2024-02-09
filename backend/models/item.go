package models

type Item struct {
	ID          string   `json:"id,omitempty"`
	UserID      string   `json:"userId"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Categories  []string `json:"categories"`
	Status      string   `json:"status"`
}
