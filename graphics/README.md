The cardback images (located in the unhelpfully named "decks" directory) were manually screenshotted and cleaned up.

The card images were taken from someone who extracted them from the cards.dll file you can find in earlier versions of Windows. See [their blog post](http://www.catonmat.net/blog/cards-dll/) for details.

Unfortunately, the bitmaps in their .zip file were corrupted and had to be fixed by manually resaving them (yes, all 52 of them) with [Paint.NET](http://www.getpaint.net/index.html). Apparently PDN can deal with minor things like borked BMP headers just fine.

The next issue was that the image corners were white instead of transparent. A Go program to fix that is in graphics/util/CardTransparencyFixer.go. It can be used like this, assuming you have some form of Unix shell installed:

    mv cards cards-nonprocessed
    mkdir cards
    cd cards
    ls ../cards-nonprocessed/*.png | xargs -t -n 1 go run ../CardTransparencyFixer.go

Some cards had red borders instead of black ones. This was fixed by manually editing each offending card.