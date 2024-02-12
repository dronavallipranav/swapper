package api

import (
	"fmt"
	"net/http"
	"os"
	"reflect"
	"swapper/models"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/ravendb/ravendb-go-client"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	Store *ravendb.DocumentStore
}

func NewUserHandler(store *ravendb.DocumentStore) *UserHandler {
	return &UserHandler{
		Store: store,
	}
}

func (h *UserHandler) RegisterUserRoutes(r *gin.Engine) {
	r.POST("/signup", h.SignUp)
	r.POST("/login", h.LoginUser)
}

type SignUpRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *UserHandler) SignUp(c *gin.Context) {
	// Parse the request body into a User struct
	var signUpReq SignUpRequest
	if err := c.ShouldBindJSON(&signUpReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(signUpReq.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	newUser := models.User{
		Name:         signUpReq.Name,
		Email:        signUpReq.Email,
		PasswordHash: string(hash),
	}

	// Open a session for operations against the database
	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open a session"})
		return
	}
	defer session.Close()

	// Store the new user in the database
	if err := session.Store(&newUser); err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store user"})
		return
	}

	// Save changes to the database
	if err := session.SaveChanges(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	// Respond to the client
	c.JSON(http.StatusOK, gin.H{"message": "User signed up successfully", "userID": newUser.ID})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

var jwtSecret []byte

func init() {
	jwtSecret = []byte(os.Getenv("JWT_SECRET_TOKEN"))
}

func (h *UserHandler) LoginUser(c *gin.Context) {
	// Parse the request body into a User struct
	var loginReq LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Open a session for operations against the database
	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open a session"})
		return
	}
	defer session.Close()

	// Query the database for the user
	var user *models.User
	tp := reflect.TypeOf(&models.User{})
	q := session.QueryCollectionForType(tp)

	q = q.WhereEquals("email", loginReq.Email).Take(1)

	var users []*models.User
	err = q.GetResults(&users)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query user"})
		return
	}

	if len(users) == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	user = users[0]

	// Compare the password hash with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(loginReq.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	})

	jwt, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": jwt})
}
