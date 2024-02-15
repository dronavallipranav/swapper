package api

import (
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"net/http"
	"path/filepath"
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

	items.POST("", middleware.AuthMiddleware(), h.AddItem)
	items.GET("", h.GetItems)
	items.GET("/:id", h.GetItem)
	items.DELETE("/:id", middleware.AuthMiddleware(), h.DeleteItem)
}

type AddItemRequest struct {
	Title       string          `form:"title" binding:"required"`
	Description string          `form:"description"`
	Quantity    *int            `form:"quantity"`
	Categories  []string        `form:"categories"`
	Location    models.Location `form:"location"`
}

func (h *ItemHandler) AddItem(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Could not parse multipart form"})
		return
	}

	var addItemReq AddItemRequest
	if err := c.ShouldBind(&addItemReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
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

	form, _ := c.MultipartForm()
	files := form.File["images"]
	for _, file := range files {
		fileStream, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
			return
		}
		defer fileStream.Close()

		mimeType := mime.TypeByExtension(filepath.Ext(file.Filename))
		err = session.Advanced().Attachments().Store(&newItem, file.Filename, fileStream, mimeType)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store attachment"})
			return
		}
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
	lat, err := strconv.ParseFloat(c.Query("lat"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid latitude"})
		return
	}

	long, err := strconv.ParseFloat(c.Query("long"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid longitude"})
		return
	}

	radius, err := strconv.ParseFloat(c.DefaultQuery("radius", "10"), 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid longitude"})
		return
	}

	limit, err := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit"})
		return
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var items []*models.Item
	q := session.QueryIndex("items/ByLocation")
	q = q.WithinRadiusOf("coordinates", radius, lat, long)
	q = q.Take(limit)

	err = q.GetResults(&items)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query items"})
		return
	}

	// attach the first image to each item
	for _, item := range items {
		attachmentData, err := getItemAttachments(c, 1, item, session)
		if err != nil {
			return // error is already added to gin context
		}
		item.Attachments = attachmentData
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

	attachmentData, err := getItemAttachments(c, -1, item, session)
	if err != nil {
		return // error is already added to gin context
	}
	item.Attachments = attachmentData

	c.JSON(http.StatusOK, gin.H{"item": item})
}

func (h *ItemHandler) DeleteItem(c *gin.Context) {
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

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if item.UserID != userID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	err = session.Delete(item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item"})
		return
	}

	err = session.SaveChanges()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted"})
}

/*
  Helpers
*/

func getItemAttachments(c *gin.Context, count int, item *models.Item, session *ravendb.DocumentSession) ([]string, error) {
	attachments, err := session.Advanced().Attachments().GetNames(item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attachment names"})
		return nil, err
	}

	max := count
	if count == -1 || count > len(attachments) {
		max = len(attachments)
	}

	attachmentData := make([]string, 0, len(attachments))
	for i, attachment := range attachments {
		if i == max {
			break
		}
		stream, err := session.Advanced().Attachments().Get(item, attachment.Name)
		if err != nil {
			continue
		}
		bytes, err := io.ReadAll(stream.Data)
		stream.Close()
		if err != nil {
			continue
		}

		base64Encoded := base64.StdEncoding.EncodeToString(bytes)
		attachmentData = append(attachmentData, base64Encoded)
	}
	return attachmentData, nil
}
