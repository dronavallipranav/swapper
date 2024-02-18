package utils

import (
	"reflect"
	"strings"
)

func ExtractOneOfOptions(v interface{}) map[string][]string {
	options := make(map[string][]string)
	val := reflect.ValueOf(v)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		tag := field.Tag.Get("validate")

		// convert the first letter of field name to lowercase
		fieldName := strings.ToLower(field.Name[:1]) + field.Name[1:]

		if strings.Contains(tag, "oneof=") {
			oneOfOptions := strings.Split(tag, "oneof=")[1]
			options[fieldName] = strings.Split(oneOfOptions, " ")
		}
	}
	return options
}
