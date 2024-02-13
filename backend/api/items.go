package api

import (
	"fmt"
	"net/http"
	"strconv"
	"swapper/middleware"
	"swapper/models"

	"github.com/gin-gonic/gin"
	"github.com/ravendb/ravendb-go-client"
)

type ItemHandler struct {
	Store *ravendb.DocumentStore
}

func NewItemHandler(store *ravendb.DocumentStore) *ItemHandler {
	return &ItemHandler{
		Store: store,
	}
}

func (h *ItemHandler) RegisterItemRoutes(r *gin.Engine) {
	items := r.Group("/items")
	//use auth middleware for all items routes and grab user from context to ensure they can only modify their items
	items.POST("", middleware.AuthMiddleware(), h.AddItem)
	items.GET("", h.GetItems)
	items.GET("/:id", h.GetItem)
}

type AddItemRequest struct {
	Title       string          `json:"title" binding:"required"`
	Description string          `json:"description"`
	Quantity    *int            `json:"quantity"`
	Categories  []string        `json:"categories"`
	Location    models.Location `json:"location"`
}

func (h *ItemHandler) AddItem(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Extract the JSON part of the request, for images
	jsonData, err := c.FormFile("data")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing data part"})
		return
	}
	dataFile, err := jsonData.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not open data part"})
		return
	}
	defer dataFile.Close()

	var addItemReq AddItemRequest
	if err := c.ShouldBindJSON(&addItemReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	//default quantity to 1 if not set
	var quantity int
	if addItemReq.Quantity != nil {
		quantity = *addItemReq.Quantity
	} else {
		quantity = 1
	}

	newItem := models.Item{
		UserID:      userID.(string),
		Title:       addItemReq.Title,
		Description: addItemReq.Description,
		Quantity:    quantity,
		Categories:  addItemReq.Categories,
		Location:    addItemReq.Location,
		Status:      "available",
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	err = session.Store(&newItem)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store item"})
		return
	}

	err = session.SaveChanges()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": newItem.ID})
}

/*
Returns items based on filters

url params:
- lat (float): latitude
- long (float): longitude
- radius (float): radius in miles
- categories (string[]): category to filter by
- status (string): status to filter by
- limit (int): limit the number of items returned (default 10)
- skip (int): skip the first n items (default 0)
- sort (string): sort by field (default "title")
- order (string): sort order (default "asc")
- search (string): search across the title field

TODO:
*/
func (h *ItemHandler) GetItems(c *gin.Context) {
	//lat := c.Query("lat")
	//long := c.Query("long")
	//radius := c.DefaultQuery("radius", "25")
	//categories := c.QueryArray("categories")
	//status := c.Query("status")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	//sort := c.DefaultQuery("sort", "title")
	//order := c.DefaultQuery("order", "asc")
	//search := c.Query("search")

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var items []*models.Item
	q := session.QueryCollection("items")
	//q = q.WithinRadiusOf("Coordinates", 250000, -74.0060, 40.7128)
	q = q.Take(limit)

	err = q.GetResults(&items)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query items"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (h *ItemHandler) GetItem(c *gin.Context) {
	id := c.Param("id")
	id = "items/" + id

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var item *models.Item
	err = session.Load(&item, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"item": item})
}
