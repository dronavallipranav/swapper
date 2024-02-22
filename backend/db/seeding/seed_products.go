package seeding

import (
	"bytes"
	"encoding/base64"
	"encoding/csv"
	"io"
	"mime"
	"os"
	"strconv"
	"strings"
	"swapper/models"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/ravendb/ravendb-go-client"
)

type Product struct {
	ASIN              string
	Title             string
	ImgURL            string
	ProductURL        string
	Stars             float64
	Reviews           int
	Price             float64
	ListPrice         float64
	CategoryID        int
	IsBestSeller      bool
	BoughtInLastMonth int
}

type Category struct {
	ID           int
	CategoryName string
}

func ParseProductsCSV(filePath string) ([]Product, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	r := csv.NewReader(file)
	_, err = r.Read() // Skip the header
	if err != nil {
		return nil, err
	}

	var products []Product
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		stars, _ := strconv.ParseFloat(record[4], 64)
		reviews, _ := strconv.Atoi(record[5])
		price, _ := strconv.ParseFloat(record[6], 64)
		listPrice, _ := strconv.ParseFloat(record[7], 64)
		categoryID, _ := strconv.Atoi(record[8])
		isBestSeller := record[9] == "True"
		boughtInLastMonth, _ := strconv.Atoi(record[10])

		product := Product{
			ASIN:              record[0],
			Title:             record[1],
			ImgURL:            record[2],
			ProductURL:        record[3],
			Stars:             stars,
			Reviews:           reviews,
			Price:             price,
			ListPrice:         listPrice,
			CategoryID:        categoryID,
			IsBestSeller:      isBestSeller,
			BoughtInLastMonth: boughtInLastMonth,
		}

		products = append(products, product)
	}
	return products, nil
}

func ParseCategoriesCSV(filePath string) ([]Category, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	r := csv.NewReader(file)
	_, err = r.Read() // Skip the header
	if err != nil {
		return nil, err
	}

	var categories []Category
	for {
		record, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		id, _ := strconv.Atoi(record[0])
		category := Category{
			ID:           id,
			CategoryName: record[1],
		}

		categories = append(categories, category)
	}
	return categories, nil
}

func CreateItem(i *models.Item, store *ravendb.DocumentStore) (string, error) {
	session, err := store.OpenSession("")
	if err != nil {
		return "", err
	}
	defer session.Close()

	err = session.Store(i)
	if err != nil {
		return "", err
	}

	// Save changes
	err = session.SaveChanges()
	if err != nil {
		return "", err
	}

	return i.ID, nil
}

func AddProductAttachments(base64Encoded []string, i *models.Item, store *ravendb.DocumentStore) error {
	for loopI, img := range base64Encoded {
		fileBytes, err := base64.StdEncoding.DecodeString(img)
		if err != nil {
			return err
		}
		// Now, convert fileBytes back into a stream for the .Store method
		byteReader := bytes.NewReader(fileBytes)
		mimeType := mime.TypeByExtension("image/png")

		session, err := store.OpenSession("")
		if err != nil {
			return err
		}
		defer session.Close()

		// retrieve user
		err = session.Load(&i, i.ID)
		if err != nil {
			return err
		}

		// Store the byteReader as an attachment
		err = session.Advanced().Attachments().Store(i, "item_"+string(loopI)+".png", byteReader, mimeType)
		if err != nil {
			return err
		}

		// Save changes
		err = session.SaveChanges()
		if err != nil {
			return err
		}
	}
	return nil
}

// Color list for checking in titles
var colors = []string{"red", "green", "blue", "black", "white", "yellow", "orange", "purple", "pink", "brown"}

func inferColor(title string) string {
	for _, color := range colors {
		if strings.Contains(strings.ToLower(title), color) {
			return color
		}
	}
	return "not specified"
}

func RandString(arr []string) string {
	return arr[gofakeit.Number(0, len(arr)-1)]
}

func InferAttributes(product Product, dbCat string) models.Attributes {
	return models.Attributes{
		Condition:        RandString([]string{"new", "used", "refurbished"}),
		Size:             RandString([]string{"small", "medium", "large"}),
		Color:            inferColor(product.Title),
		ShippingOptions:  RandString([]string{"localPickup", "domesticShipping", "internationalShipping"}),
		OwnershipHistory: RandString([]string{"firstOwner", "secondOwner", "multipleOwners"}),
		Authenticity:     RandString([]string{"authentic", "replica", "unauthorized"}),
		ListingType:      RandString([]string{"sale", "rent", "exchange"}),
		ItemCategory:     dbCat,
	}
}
