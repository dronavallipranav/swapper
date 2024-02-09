package main

import (
	"log"
	"swapper/db"

	"github.com/gin-gonic/gin"
	"github.com/ravendb/ravendb-go-client"
)

func main() {
	documentStore, err := db.InitDocumentStore([]string{"http://localhost:8080"}, "swapper")
	if err != nil {
		log.Fatalf("Failed to initialize document store: %v", err)
	}
	defer documentStore.Close()

	r := gin.Default()

	setupRoutes(r, documentStore)

	if err := r.Run(); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

func setupRoutes(r *gin.Engine, store *ravendb.DocumentStore) {

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, world!",
		})
	})
}
