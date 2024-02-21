package seeding

import (
	"encoding/csv"
	"io"
	"os"
	"strconv"
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
