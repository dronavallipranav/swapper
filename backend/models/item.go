package models

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// model for an item with associated userID
type Item struct {
	ID          string   `json:"id,omitempty"`
	UserID      string   `json:"userId"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Quantity    int      `json:"quantity"`
	Categories  []string `json:"categories"`
	Status      string   `json:"status"`
	Location    Location `json:"location"`
	Attachments []string `json:"attachments"`
}
