package api

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"swapper/middleware"
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
	r.PUT("/user", middleware.AuthMiddleware(), h.UpdateUser)
	r.GET("/users/:id", h.GetUser)
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

	// check for other users with the same email
	tp := reflect.TypeOf(&models.User{})
	q := session.QueryCollectionForType(tp)
	q = q.WhereEquals("email", signUpReq.Email).Take(1)

	var users []*models.User
	err = q.GetResults(&users)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query user"})
		return
	}

	if len(users) > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

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

	// then create token to send back
	// the id should be generated by the database and assigned back on the struct
	fmt.Println(newUser)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":    newUser.ID,
		"email": newUser.Email,
		"name":  newUser.Name,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	})

	jwt, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": jwt})
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

type UpdateUserRequest struct {
	Name     string `form:"name"`
	Email    string `form:"email"`
	Password string `form:"password"`
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Could not parse multipart form"})
		return
	}

	var updateUserReq UpdateUserRequest
	if err := c.ShouldBind(&updateUserReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	// load current user model
	var u *models.User
	err = session.Load(&u, userID.(string))
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load user"})
		return
	}

	if updateUserReq.Name != "" {
		u.Name = updateUserReq.Name
	}

	if updateUserReq.Email != "" {
		// check for other users with the same email
		tp := reflect.TypeOf(&models.User{})
		q := session.QueryCollectionForType(tp)
		q = q.WhereEquals("email", updateUserReq.Email).Take(1)

		var users []*models.User
		err = q.GetResults(&users)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query user"})
			return
		}

		if len(users) > 0 {
			// if the first user is the one making the request it's ok, if it isnt its abd
			if len(users) == 1 {
				if users[0].ID != u.ID {
					c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
					return
				}
			} else {
				c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
				return
			}
		}

		u.Email = updateUserReq.Email
	}

	if updateUserReq.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(updateUserReq.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		u.PasswordHash = string(hash)
	}

	err = session.Store(u)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store user"})
		return
	}

	err = session.SaveChanges()
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
		return
	}

	form, _ := c.MultipartForm()
	files := form.File["profilePicture"]
	if len(files) > 0 {
		// ok we have a new pfp so we need to delete all existing attachments if any
		attachments, err := session.Advanced().Attachments().GetNames(u)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attachment names"})
			return
		}

		for _, attachment := range attachments {
			err = session.Advanced().Attachments().Delete(u, attachment.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete attachment"})
				return
			}
		}

		err = session.SaveChanges()
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
			return
		}

		file := files[0]
		ext := filepath.Ext(file.Filename)
		if ext != ".jpg" && ext != ".png" && ext != ".jpeg" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Only jpg, png, and jpeg files are allowed"})
			return
		}

		fileStream, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
			return
		}
		defer fileStream.Close()

		fileBytes, err := io.ReadAll(fileStream)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
			return
		}
		fileStream.Close() // Ensure the file is closed after reading

		// Prepare the base64Encoded string
		contentType := http.DetectContentType(fileBytes)
		base64Encoded := base64.StdEncoding.EncodeToString(fileBytes)
		base64Encoded = fmt.Sprintf("data:%s;base64,%s", contentType, base64Encoded)

		// Now, convert fileBytes back into a stream for the .Store method
		byteReader := bytes.NewReader(fileBytes)
		mimeType := mime.TypeByExtension(ext) // This was determined from the file extension earlier

		// Store the byteReader as an attachment
		err = session.Advanced().Attachments().Store(u, file.Filename, byteReader, mimeType)
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store attachment"})
			return
		}

		// Proceed to save changes
		err = session.SaveChanges()
		if err != nil {
			fmt.Println(err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save changes"})
			return
		}

		u.ProfilePicture = base64Encoded
	}

	u.PasswordHash = ""

	c.JSON(http.StatusOK, gin.H{"user": u})
}

func (h *UserHandler) GetUser(c *gin.Context) {
	userID := "users/" + c.Param("id")

	session, err := h.Store.OpenSession("")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open session"})
		return
	}
	defer session.Close()

	var u *models.User
	err = session.Load(&u, userID)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load user"})
		return
	}

	if u == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// read attachments
	attachments, err := session.Advanced().Attachments().GetNames(u)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attachment names"})
		return
	}

	if len(attachments) > 0 {
		attachment := attachments[0]
		stream, err := session.Advanced().Attachments().Get(u, attachment.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get attachment"})
			return
		}
		bytes, err := io.ReadAll(stream.Data)
		stream.Close()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read attachment"})
			return
		}

		base64Encoded := base64.StdEncoding.EncodeToString(bytes)

		// add front mimetype to base64 string
		base64Encoded = fmt.Sprintf("data:%s;base64,%s", stream.Details.ContentType, base64Encoded)

		u.ProfilePicture = base64Encoded
	}

	u.PasswordHash = ""
	c.JSON(http.StatusOK, gin.H{"user": u})
}
