package seeding

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"swapper/models"
	"time"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/ravendb/ravendb-go-client"
)

func Seed(store *ravendb.DocumentStore) {
	PRODUCTS_ZIP := "db/seeding/datasets/products.zip"
	REVIEWS_ZIP := "db/seeding/datasets/reviews.zip"
	PRODUCTS_UNZIP := "db/seeding/datasets/products"
	REVIEWS_UNZIP := "db/seeding/datasets/reviews"

	fmt.Println("Seeding database... this may take a while")

	// First check if we're seeded or not
	session, err := store.OpenSession("")
	if err != nil {
		log.Fatalf("Failed to open session: %v", err)
		return
	}
	defer session.Close()

	// Check for document "seeded"
	type SeededType struct {
		Seeded bool `json:"seeded"`
	}

	var seeded *SeededType = &SeededType{}
	err = session.Load(&seeded, "seeded")
	if err != nil {
		log.Fatalf("Failed to load seeded document: %v", err)
	}

	if seeded.Seeded {
		log.Println("Already seeded")
		return
	}

	if !checkExists(PRODUCTS_ZIP) {
		log.Fatalf(PRODUCTS_ZIP + "not found. Please download the datasets from the backend/db/seeding/readme")
		return
	}

	if !checkExists(REVIEWS_ZIP) {
		log.Fatalf(REVIEWS_ZIP + " not found. Please download the datasets from the backend/db/seeding/readme")
		return
	}

	// Unzip products
	if err := unzip(PRODUCTS_ZIP, PRODUCTS_UNZIP); err != nil {
		fmt.Printf("Error unzipping file: %s\n", err)
		return
	}

	// Unzip reviews
	if err := unzip(REVIEWS_ZIP, REVIEWS_UNZIP); err != nil {
		fmt.Printf("Error unzipping file: %s\n", err)
		return
	}

	// count number of users currently in the database
	var users []*models.User
	err = session.QueryCollectionForType(reflect.TypeOf(models.User{})).GetResults(&users)
	if err != nil {
		fmt.Printf("Error getting users: %s\n", err)
		return
	}

	fakeCount := 100
	userIDs := make([]string, fakeCount)
	// add users to the userIDs array
	for i, user := range users {
		userIDs[i] = user.ID
	}

	if len(users) < fakeCount {
		for i := len(users); i < fakeCount; i++ {
			if i%10 == 0 {
				fmt.Printf("Seeding user %d of %d\n", i, fakeCount)
			}

			u := GenerateFakeUser()

			//base64img := u.ProfilePicture
			u.ProfilePicture = ""

			setID, err := CreateUser(u, store)
			if err != nil {
				fmt.Printf("Error creating user: %s\n", err)
				return
			}

			userIDs[i] = setID

			// Note: the fakerjs generates just images with rng, so we can't use it for seeding
			/*err = AddUserAttachments(base64img, u, store)
			if err != nil {
				fmt.Printf("Error adding attachments: %s\n", err)
				return
			}*/
		}
	}

	// Load amazon_products.csv
	productsFile := "db/seeding/datasets/products/amazon_products.csv"
	products, err := ParseProductsCSV(productsFile)
	if err != nil {
		fmt.Printf("Error parsing products file: %s\n", err)
		return
	}

	categoriesFile := "db/seeding/datasets/products/amazon_categories.csv"
	categories, err := ParseCategoriesCSV(categoriesFile)
	if err != nil {
		fmt.Printf("Error parsing categories file: %s\n", err)
		return
	}

	// count # of products currently in the database
	var items []*models.Item
	err = session.QueryCollectionForType(reflect.TypeOf(models.Item{})).GetResults(&items)
	if err != nil {
		fmt.Printf("Error getting items: %s\n", err)
		return
	}

	max_products := 5000
	product_ids := make([]string, max_products)

	// add products to the product_ids array
	for i, item := range items {
		product_ids[i] = item.ID
	}

	lat_lon_arr := []models.Location{
		{Latitude: 43.0731, Longitude: -89.4012},
		{Latitude: 40.7127281, Longitude: 74.0060152},
	}

	if len(items) < max_products {
		for i := len(items); i < max_products; i++ {
			product := products[i]
			if i%1000 == 0 {
				fmt.Printf("Seeding product %d of %d\n", i, max_products)
			}

			for _, category := range categories {
				if product.CategoryID == category.ID {

					dbCat := GetItemCategory(product.CategoryID)

					shortenedTitle := product.Title
					if len(shortenedTitle) > 25 {
						shortenedTitle = shortenedTitle[:25]
						shortenedTitle = strings.TrimSuffix(shortenedTitle, " ")
					}

					newItem := &models.Item{
						UserID:      userIDs[i%fakeCount],
						Title:       shortenedTitle,
						Description: gofakeit.ProductDescription(),
						Quantity:    gofakeit.Number(1, 10),
						Categories:  []string{},
						Status:      "available",
						Location:    lat_lon_arr[i%len(lat_lon_arr)],
						Attributes: models.Attributes{
							Condition:        RandString([]string{"new", "used", "refurbished"}),
							Size:             RandString([]string{"small", "medium", "large"}),
							Color:            RandString([]string{"red", "green", "blue", "black", "white", "yellow", "orange", "purple", "pink", "brown"}),
							ShippingOptions:  RandString([]string{"localPickup", "domesticShipping", "internationalShipping"}),
							ListingType:      RandString([]string{"sale", "rent", "exchange"}),
							ItemCategory:     dbCat,
							OwnershipHistory: RandString([]string{"firstOwner", "secondOwner", "multipleOwners"}),
							Authenticity:     RandString([]string{"authentic", "replica", "unauthorized"}),
						},
						CreatedAt: time.Now(),
					}

					if product.ImgURL == "" {
						fmt.Println("No image URL for product: ", product.Title, "url", product.ImgURL)
						continue
					}

					s, err := getImageAsBase64(product.ImgURL)
					if err != nil {
						fmt.Printf("Error getting image as base64: %s\n", err)
						continue
					}

					_, err = CreateItem(newItem, store)
					if err != nil {
						fmt.Printf("Error creating item: %s\n", err)
						return
					}

					// add the base64 encoded image stream as an attachment to the item
					err = AddProductAttachments([]string{s}, newItem, store)
					if err != nil {
						fmt.Printf("Error adding attachments: %s\n", err)
						return
					}

					product_ids[i] = newItem.ID

				}
			}
		}
	}

	reviewsFile := "db/seeding/datasets/reviews/Cell_Phones_and_Accessories_5.json"
	reviews, err := ParseReviewsJSON(reviewsFile)
	if err != nil {
		fmt.Printf("Error parsing reviews file: %s\n", err)
		return
	}

	max_reviews := 50000

	// count number of reviews
	var ratings []*models.Rating
	err = session.QueryCollectionForType(reflect.TypeOf(models.Rating{})).GetResults(&ratings)
	if err != nil {
		fmt.Printf("Error getting ratings: %s\n", err)
		return
	}

	if len(ratings) < max_reviews {
		for i := len(ratings); i < max_reviews; i++ {
			review := reviews[i]
			if i%1000 == 0 {
				fmt.Printf("Seeding review %d of %d\n", i, max_reviews)
			}

			if i > max_reviews {
				break
			}

			// Pick a random product to attach the review to
			productID := product_ids[gofakeit.Number(0, len(product_ids)-1)]

			// Create a new rating model
			newRating := &models.Rating{
				RecipientID:     productID,
				CreatorID:       userIDs[gofakeit.Number(0, fakeCount-1)],
				RecipientIsItem: true,
				Title:           review.Summary,
				Body:            review.ReviewText,
				Stars:           int(review.Overall),
				CreatedAt:       time.Unix(review.UnixReviewTime, 0),
			}

			_, err = StoreRating(newRating, store)
			if err != nil {
				fmt.Printf("Error creating rating: %s\n", err)
				return
			}
		}
	}

	// TODO: we need to seed user ratings as well

	// End of seeding, mark as seeded complete
	seeded.Seeded = true
	//TODO: session.Store(seeded)

	fmt.Println("Seeding complete")
}

func checkExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func unzip(zipFile, destDir string) error {
	reader, err := zip.OpenReader(zipFile)
	if err != nil {
		return err
	}
	defer reader.Close()

	// Ensure the destination directory exists
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return err
	}

	for _, file := range reader.File {
		// Construct the path to extract to
		path := filepath.Join(destDir, file.Name)

		// Check for ZipSlip (Directory traversal)
		if !strings.HasPrefix(path, filepath.Clean(destDir)+string(os.PathSeparator)) {
			return fmt.Errorf("invalid file path: %s", path)
		}

		// Create directory tree
		if file.FileInfo().IsDir() {
			os.MkdirAll(path, file.Mode())
			continue
		}

		// Extract file
		fileReader, err := file.Open()
		if err != nil {
			return err
		}
		defer fileReader.Close()

		targetFile, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.Mode())
		if err != nil {
			return err
		}
		defer targetFile.Close()

		if _, err := io.Copy(targetFile, fileReader); err != nil {
			return err
		}
	}

	return nil
}

func untarGz(tgzFile, destDir string) error {
	// Open the .tgz file
	file, err := os.Open(tgzFile)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Create a gzip reader
	gzr, err := gzip.NewReader(file)
	if err != nil {
		return fmt.Errorf("failed to create gzip reader: %w", err)
	}
	defer gzr.Close()

	// Create a tar reader
	tarr := tar.NewReader(gzr)

	// Iterate through the files in the tar archive
	for {
		header, err := tarr.Next()
		if err == io.EOF {
			break // End of archive
		}
		if err != nil {
			return fmt.Errorf("tar reading error: %w", err)
		}

		// Construct the path to the extracted file or directory
		path := filepath.Join(destDir, header.Name)

		switch header.Typeflag {
		case tar.TypeDir: // Directory
			if err := os.MkdirAll(path, os.FileMode(header.Mode)); err != nil {
				return fmt.Errorf("failed to create directory: %w", err)
			}
		case tar.TypeReg: // Regular file
			outFile, err := os.OpenFile(path, os.O_CREATE|os.O_RDWR, os.FileMode(header.Mode))
			if err != nil {
				return fmt.Errorf("failed to open file: %w", err)
			}

			// Copy the file data from the tar archive to the new file
			if _, err := io.Copy(outFile, tarr); err != nil {
				outFile.Close() // Close the file on error, ignoring close errors as copy error is more important
				return fmt.Errorf("failed to copy file content: %w", err)
			}
			outFile.Close() // Ensure we close the file
		}
	}

	return nil
}

func RandString(arr []string) string {
	return arr[gofakeit.Number(0, len(arr)-1)]
}

func GetItemCategory(id int) string {
	switch id {
	case 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 137:
		return "crafts"
	case 12, 13, 177:
		return "partySupplies"
	case 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28:
		return "automotive"
	case 29, 30, 31, 32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43, 44:
		return "baby"
	case 45, 46, 47, 48, 49, 50, 51, 52, 53:
		return "beauty"
	case 54, 55, 56, 57, 58, 60, 63, 64, 65, 66, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83:
		return "electronics"
	case 84, 87, 88, 89, 90, 91, 94, 95, 96, 97, 98, 110, 112, 113, 114, 116, 118, 120, 121, 122, 123, 264, 265:
		return "clothing"
	case 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109:
		return "travel"
	case 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 158, 159:
		return "health"
	case 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 160, 161, 162:
		return "industrial"
	case 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 201, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215:
		return "homeAndGarden"
	case 178, 179, 180, 181, 182, 183, 184:
		return "petSupplies"
	case 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197:
		return "smartHome"
	case 198, 199, 200:
		return "sports"
	case 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 270:
		return "toys"
	case 241, 242, 243, 244, 245, 248, 249, 250, 251, 252, 253, 254, 255, 256, 259, 260, 261, 262, 263:
		return "games"
	default:
		return "other"
	}
}

// getImageAsBase64 downloads an image from the given URI and returns it as a base64 encoded string.
func getImageAsBase64(imageURI string) (string, error) {
	// Send a GET request to the image URI
	client := &http.Client{}

	// Prepare a custom request to have more control over headers
	req, err := http.NewRequest("GET", imageURI, nil)
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	// Set a fake User-Agent and other headers to mimic a real browser
	req.Header.Set("authority", "m.media-amazon.com")
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8")
	req.Header.Set("accept-language", "en-US,en;q=0.9")
	req.Header.Set("cache-control", "no-cache")
	req.Header.Set("pragma", "no-cache")
	req.Header.Set("sec-ch-ua", `"Not A(Brand";v="99", "Brave";v="121", "Chromium";v="121"`)
	req.Header.Set("sec-ch-ua-mobile", "?0")
	req.Header.Set("sec-ch-ua-platform", `"macOS"`)
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-site", "none")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-gpc", "1")
	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")

	// Perform the request using the custom client
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error fetching image: %w", err)
	}
	defer resp.Body.Close()

	// Check if the GET request was successful
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch image: HTTP status %d", resp.StatusCode)
	}

	// Read the response body (image data) into a byte slice
	imgData, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading image data: %w", err)
	}

	// Encode the byte slice into a base64 string
	base64Str := base64.StdEncoding.EncodeToString(imgData)

	return base64Str, nil
}
