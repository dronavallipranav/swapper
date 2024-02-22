package models

import "time"

type Attributes struct {
	Condition        string `json:"condition" form:"condition" validate:"omitempty,oneof=new used refurbished"`
	Size             string `json:"size" form:"size" validate:"omitempty,oneof=small medium large"`
	Color            string `json:"color" form:"color" validate:"omitempty,oneof=red green blue black white yellow orange purple pink brown"`
	ShippingOptions  string `json:"shippingOptions" form:"shippingOptions" validate:"omitempty,oneof=localPickup domesticShipping internationalShipping"`
	ListingType      string `json:"listingType" form:"listingType" validate:"omitempty,oneof=sale rent exchange"`
	ItemCategory     string `json:"itemCategory" form:"itemCategory" validate:"omitempty,oneof=electronics homeAndGarden fashion beauty health sports outdoors automotive books music games toys collectibles art crafts clothing baby beauty petSupplies travel"`
	OwnershipHistory string `json:"ownershipHistory" form:"ownershipHistory" validate:"omitempty,oneof=firstOwner secondOwner multipleOwners"`
	Authenticity     string `json:"authenticity" form:"authenticity" validate:"omitempty,oneof=authentic replica unauthorized"`
}

// Remaining structs (Location, Item) remain unchanged

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// model for an item with associated userID
type Item struct {
	ID          string     `json:"id,omitempty"`
	UserID      string     `json:"userId"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Quantity    int        `json:"quantity"`
	Categories  []string   `json:"categories"`
	Status      string     `json:"status"`
	Location    Location   `json:"location"`
	Attachments []string   `json:"attachments"`
	Attributes  Attributes `json:"attributes"`
	CreatedAt   time.Time  `json:"createdAt"`
	AvgRating   float64    `json:"avgRating"`
	NumRatings  int        `json:"numRatings"`
}
