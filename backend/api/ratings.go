package api

import (
	"fmt"
	"net/http"
	"swapper/middleware"
	"swapper/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/ravendb/ravendb-go-client"
)

type RatingHandler struct {
	Store *ravendb.DocumentStore
}

func NewRatingHandler(store *ravendb.DocumentStore) *RatingHandler {
	return &RatingHandler{Store: store}
}

// RegisterRatingRoutes sets up the routes for rating operations.
func (h *RatingHandler) RegisterRatingRoutes(r *gin.Engine) {
	r.POST("/ratings", middleware.AuthMiddleware(), h.CreateRating)
	r.GET("/ratings/:id", h.GetRating)
	r.PUT("/ratings/:id", middleware.AuthMiddleware(), h.UpdateRating)
	r.DELETE("/ratings/:id", middleware.AuthMiddleware(), h.DeleteRating)
}

type CreateRatingRequest struct {
	CreatorID       string `json:"creatorID" binding:"required"`
	RecipientID     string `json:"recipientID" binding:"required,nefield=CreatorID"`
	RecipientIsItem bool   `json:"recipientIsItem" binding:"required"`
	Title           string `json:"title" binding:"required"`
	Body            string `json:"body" binding:"required"`
	Stars           int    `json:"stars" binding:"required,numeric,min=1,max=10"`
}

func (h *RatingHandler) CreateRating(c *gin.Context) {
	var req CreateRatingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}
	userID, exists := c.Get("userID")
	if !exists || userID.(string) == req.RecipientID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot rate yourself or Unauthorized"})
		return
	}

	rating := models.Rating{
		CreatorID:       userID.(string),
		RecipientID:     req.RecipientID,
		RecipientIsItem: req.RecipientIsItem,
		Title:           req.Title,
		Body:            req.Body,
		Stars:           req.Stars,
		CreatedAt:       time.Now(),
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open a session"})
		return
	}
	defer session.Close()

	var ratings []*models.Rating
	ratingsQuery := session.QueryCollection("Ratings")
	ratingsQuery = ratingsQuery.WhereEquals("recipientID", req.RecipientID)
	ratingsQuery = ratingsQuery.WhereEquals("creatorID", userID)
	err = ratingsQuery.GetResults(&ratings)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query ratings for item"})
		return
	}

	if len(ratings) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You have already rated this item"})
		return
	}

	if err := session.Store(&rating); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store rating"})
		return
	}
	if err := session.SaveChanges(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	c.JSON(http.StatusCreated, rating)
}

// GetRating retrieves a rating by its ID.
func (h *RatingHandler) GetRating(c *gin.Context) {
	id := c.Param("id")

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var rating models.Rating
	if err := session.Load(&rating, id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rating not found"})
		return
	}

	c.JSON(http.StatusOK, rating)
}

// UpdateRating handles updating an existing rating.
func (h *RatingHandler) UpdateRating(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req models.Rating
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// Validate the request
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open a session"})
		return
	}
	defer session.Close()

	var rating models.Rating
	if err := session.Load(&rating, id); err != nil || rating.CreatorID != userID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized or rating not found"})
		return
	}

	// Prevent self-review update
	if req.RecipientID == userID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot rate yourself"})
		return
	}

	rating.Title = req.Title
	rating.Body = req.Body
	rating.Stars = req.Stars
	if err := session.Store(&rating); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update rating"})
		return
	}

	if err := session.SaveChanges(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	c.JSON(http.StatusOK, rating)
}

// DeleteRating handles the deletion of a rating.
func (h *RatingHandler) DeleteRating(c *gin.Context) {
	id := "ratings/" + c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var rating *models.Rating
	if err := session.Load(&rating, id); err != nil || rating.CreatorID != userID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized or rating not found"})
		return
	}

	if err := session.Delete(rating); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rating not found or failed to delete"})
		return
	}

	if err := session.SaveChanges(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rating deleted successfully"})
}
