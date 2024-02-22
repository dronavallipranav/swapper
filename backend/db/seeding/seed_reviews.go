package seeding

import (
	"bufio"
	"encoding/json"
	"os"
	"swapper/models"

	"github.com/ravendb/ravendb-go-client"
)

type Review struct {
	ReviewerID     string
	ASIN           string
	ReviewerName   string
	Helpful        [2]int
	ReviewText     string
	Overall        float64
	Summary        string
	UnixReviewTime int64
	ReviewTime     string
}

// ParseReviewsJSON function reads a JSON file containing reviews and unmarshals them into a slice of Review structs.
func ParseReviewsJSON(filePath string) ([]Review, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var reviews []Review
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		var review Review
		err := json.Unmarshal(scanner.Bytes(), &review)
		if err != nil {
			// Decide how to handle this error; skip the line, log it, return an error, etc.
			continue // For now, we'll just skip this line.
		}
		reviews = append(reviews, review)
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return reviews, nil
}

func StoreRating(rating *models.Rating, store *ravendb.DocumentStore) (string, error) {
	session, err := store.OpenSession("")
	if err != nil {
		return "", err
	}
	defer session.Close()

	err = session.Store(rating)
	if err != nil {
		return "", err
	}

	// Save changes
	err = session.SaveChanges()
	if err != nil {
		return "", err
	}

	return rating.ID, nil
}
