package dtos

type TranslateTextForm struct {
	Text string `json:"text" binding:"Required"`
}
