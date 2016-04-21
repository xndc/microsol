package main
import "image"
import "image/png"
import "image/color"
import "image/draw"
import "os"
import "path"

func main() {
	file, err := os.Open(os.Args[1])
	if err != nil {
		panic(err)
	}
	
	imgsrc, err := png.Decode(file)
	if err != nil {
		panic(err)
	}

	// see http://blog.golang.org/go-imagedraw-package
	// "Converting an image to RGBA"
	bounds := imgsrc.Bounds()
	img := image.NewRGBA(image.Rect(0, 0, bounds.Dx(), bounds.Dy()))
	draw.Draw(img, img.Bounds(), imgsrc, bounds.Min, draw.Src)

	// Blank out (set the alpha to 0 for) the pixels at:
	// (0,0),   (0,1),   (1,0)   top-left
	// (69,0),  (70,0),  (70,1)  top-right
	// (0,94),  (0,95),  (1,95)  bottom-left
	// (69,95), (70,95), (70,94) bottom-right
	img.Set(0, 0,   color.RGBA{1, 0, 0, 0})
	img.Set(0, 1,   color.RGBA{1, 0, 0, 0})
	img.Set(1, 0,   color.RGBA{1, 0, 0, 0})
	img.Set(69, 0,  color.RGBA{1, 0, 0, 0})
	img.Set(70, 0,  color.RGBA{1, 0, 0, 0})
	img.Set(70, 1,  color.RGBA{1, 0, 0, 0})
	img.Set(0, 94,  color.RGBA{1, 0, 0, 0})
	img.Set(0, 95,  color.RGBA{1, 0, 0, 0})
	img.Set(1, 95,  color.RGBA{1, 0, 0, 0})
	img.Set(69, 95, color.RGBA{1, 0, 0, 0})
	img.Set(70, 95, color.RGBA{1, 0, 0, 0})
	img.Set(70, 94, color.RGBA{1, 0, 0, 0})

	wfile, err := os.Create(path.Base(os.Args[1]))
	if err != nil {
		panic(err)
	}

	png.Encode(wfile, img)
}