package seeding

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"mime"
	"os"
	"path/filepath"
	"strings"
	"swapper/models"

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

	// make fake users
	fakeCount := 100
	userIDs := make([]string, fakeCount)
	for i := 0; i < fakeCount; i++ {
		u := GenerateFakeUser()
		userIDs[i] = u.ID

		// decode the base64 string into a byte array
		base64Encoded := u.ProfilePicture
		fileBytes, err := base64.StdEncoding.DecodeString(base64Encoded)
		// Now, convert fileBytes back into a stream for the .Store method
		byteReader := bytes.NewReader(fileBytes)
		mimeType := mime.TypeByExtension("image/png")

		u.ProfilePicture = "" // Clear the profile picture field
		err = session.Store(u)
		if err != nil {
			fmt.Printf("Error storing user: %s\n", err)
			return
		}

		err = session.SaveChanges()
		if err != nil {
			fmt.Println(err.Error())
			return
		}

		// pull
		u = &models.User{}
		err = session.Load(&u, userIDs[i])
		if err != nil {
			fmt.Println("Error loading user: " + err.Error())
			return
		}

		// Store the byteReader as an attachment
		err = session.Advanced().Attachments().Store(*u, "pfp.png", byteReader, mimeType)
		if err != nil {
			fmt.Println("Error storing attachment: " + err.Error())
			return
		}

		// Proceed to save changes
		err = session.SaveChanges()
		if err != nil {
			fmt.Println(err.Error())
			return
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

	for _, product := range products {
		for _, category := range categories {
			if product.CategoryID == category.ID {

			}
		}
	}

	// parse out the products and insert into the database

	// Load amazon_reviews.csv

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
