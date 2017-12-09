package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/middleware"
)

var translateMap = make(map[string]string)

func init() {
	f, err := ioutil.ReadFile("i18n/en.json")
	if err != nil {
		fmt.Println(err.Error())
	}
	json.Unmarshal(f, &translateMap)
}

// GET /api/trans
func SaveNotTranslateText(c *middleware.Context, form dtos.TranslateTextForm) Response {
	c.Logger.Info("translate map", "map", translateMap, "form", form)
	if _, ok := translateMap[form.Text]; !ok {
		translateMap[form.Text] = ""
		b, err := json.MarshalIndent(translateMap, "", "  ")
		if err != nil {
			c.Logger.Error("SaveNotTranslateText", "error", err)
		}
		ioutil.WriteFile("i18n/en.json", b, 0644)
	}
	return ApiSuccess("not found translate Text added.")
}
