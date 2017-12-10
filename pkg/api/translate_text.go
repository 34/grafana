package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"sync"
	"time"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/middleware"
)

const translateFile = "public/locale/raw-en.json"

type translateData struct {
	locker       sync.Mutex
	LastUpdateAt time.Time
	TransMap     map[string]string
}

func (d *translateData) Get(k string) (string, bool) {
	d.locker.Lock()
	defer d.locker.Unlock()

	v, ok := d.TransMap[k]
	return v, ok
}

func (d *translateData) Set(k, v string) {
	d.locker.Lock()
	defer d.locker.Unlock()

	d.TransMap[k] = v
}

func (d *translateData) Load() {
	d.locker.Lock()
	defer d.locker.Unlock()

	f, err := ioutil.ReadFile(translateFile)
	if err != nil {
		fmt.Println("error read file " + err.Error())
		return
	}
	json.Unmarshal(f, &data.TransMap)
	d.LastUpdateAt = time.Now()
	fmt.Printf("load %s, %v \n", translateFile, data.TransMap)
}

func (d *translateData) Reload() {
	if time.Now().After(d.LastUpdateAt.Add(time.Duration(5 * time.Second))) {
		d.Load()
	}
}

var data = translateData{
	TransMap:     make(map[string]string),
	LastUpdateAt: time.Now(),
}

func init() {
	data.Load()
}

// GET /api/trans
func SaveNotTranslateText(c *middleware.Context, form dtos.TranslateTextForm) Response {
	data.Reload()

	if _, ok := data.Get(form.Text); !ok {
		data.Set(form.Text, "")
		b, err := json.MarshalIndent(data.TransMap, "", "  ")
		if err != nil {
			c.Logger.Error("SaveNotTranslateText.MarshalIntent", "error", err)
		}
		err = ioutil.WriteFile(translateFile, b, 0644)
		if err != nil {
			c.Logger.Error("SaveNotTranslateText.WriteFile", "error", err)
		}
	}
	return ApiSuccess("not found translate Text added.")
}
