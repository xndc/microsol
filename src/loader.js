/* This file loads the game's scripts and assets. Scripts are loaded synchronously, unless you're
   using a really retarded browser. (Like, say, IE9 and below.)
   This should probably be placed at the end of the body tag. I'm not sure what would happen if you
   put it in <head>. Some say it will work, some say it will turn the Sun into a black hole with
   identical mass that will kill us all. I mean, the cold will. The black hole obviously won't. */

// Image loader:
// Take every filename in ImageLoaderList and put an associated <img> tag in Images with the same
// key. This tag can then be used by CanvasRenderingContext2D.drawImage().
var Images = {};
var ImageLoaderList = {
    // TODO: rename -blank to -empty.
    "foundation-blank": "graphics/card-top-placeholder.png",
    // TODO: rename the deck-* stuff to stock-*.
    "deck-blank":       "graphics/deck-blank.png",
    "deck-0":           "graphics/decks/deck-0.png",
    "deck-1":           "graphics/decks/deck-1.png",
    "deck-2":           "graphics/decks/deck-2.png",
    "deck-3":           "graphics/decks/deck-3.png",
    "deck-4":           "graphics/decks/deck-4.png",
    "deck-5":           "graphics/decks/deck-5.png",
    "deck-6":           "graphics/decks/deck-6.png",
    "deck-7":           "graphics/decks/deck-7.png",
    "deck-8":           "graphics/decks/deck-8.png",
    "deck-9":           "graphics/decks/deck-9.png",
    "deck-10":          "graphics/decks/deck-10.png",
    "deck-11":          "graphics/decks/deck-11.png",
    "card-1":           "graphics/cards/1.png",
    "card-2":           "graphics/cards/2.png",
    "card-3":           "graphics/cards/3.png",
    "card-4":           "graphics/cards/4.png",
    "card-5":           "graphics/cards/5.png",
    "card-6":           "graphics/cards/6.png",
    "card-7":           "graphics/cards/7.png",
    "card-8":           "graphics/cards/8.png",
    "card-9":           "graphics/cards/9.png",
    "card-10":          "graphics/cards/10.png",
    "card-11":          "graphics/cards/11.png",
    "card-12":          "graphics/cards/12.png",
    "card-13":          "graphics/cards/13.png",
    "card-14":          "graphics/cards/14.png",
    "card-15":          "graphics/cards/15.png",
    "card-16":          "graphics/cards/16.png",
    "card-17":          "graphics/cards/17.png",
    "card-18":          "graphics/cards/18.png",
    "card-19":          "graphics/cards/19.png",
    "card-20":          "graphics/cards/20.png",
    "card-21":          "graphics/cards/21.png",
    "card-22":          "graphics/cards/22.png",
    "card-23":          "graphics/cards/23.png",
    "card-24":          "graphics/cards/24.png",
    "card-25":          "graphics/cards/25.png",
    "card-26":          "graphics/cards/26.png",
    "card-27":          "graphics/cards/27.png",
    "card-28":          "graphics/cards/28.png",
    "card-29":          "graphics/cards/29.png",
    "card-30":          "graphics/cards/30.png",
    "card-31":          "graphics/cards/31.png",
    "card-32":          "graphics/cards/32.png",
    "card-33":          "graphics/cards/33.png",
    "card-34":          "graphics/cards/34.png",
    "card-35":          "graphics/cards/35.png",
    "card-36":          "graphics/cards/36.png",
    "card-37":          "graphics/cards/37.png",
    "card-38":          "graphics/cards/38.png",
    "card-39":          "graphics/cards/39.png",
    "card-40":          "graphics/cards/40.png",
    "card-41":          "graphics/cards/41.png",
    "card-42":          "graphics/cards/42.png",
    "card-43":          "graphics/cards/43.png",
    "card-44":          "graphics/cards/44.png",
    "card-45":          "graphics/cards/45.png",
    "card-46":          "graphics/cards/46.png",
    "card-47":          "graphics/cards/47.png",
    "card-48":          "graphics/cards/48.png",
    "card-49":          "graphics/cards/49.png",
    "card-50":          "graphics/cards/50.png",
    "card-51":          "graphics/cards/51.png",
    "card-52":          "graphics/cards/52.png",
}

// Create a <div> to keep all the <img>s in.
var ImageLoaderDOMContainer           = document.createElement("div");
ImageLoaderDOMContainer.id            = "ImageLoader";
ImageLoaderDOMContainer.style.display = "none";
document.body.appendChild(ImageLoaderDOMContainer);

// Load the images.
Object.keys(ImageLoaderList).forEach(function(key) {
    var filename = ImageLoaderList[key];
    var tag      = document.createElement("img");

    tag.src = filename;

    ImageLoaderDOMContainer.appendChild(tag);
    Images[key] = tag;
})

// Logging.
console.log("loader.js: images loaded (async)");


// Script loader:
// Take every filename in ScriptLoaderList and attach a <script> tag for it to the document.
var ScriptLoaderList = [
    "src/util.js",
    "src/card.js",
    "src/events.js",
    "src/main.js",
]

// Create a <div> to keep all the <script>s in. (Not really required, just nice for debugging)
var ScriptLoaderDOMContainer           = document.createElement("div");
ScriptLoaderDOMContainer.id            = "ScriptLoader";
ScriptLoaderDOMContainer.style.display = "none";
document.body.appendChild(ScriptLoaderDOMContainer);

// Load the scripts.
ScriptLoaderList.forEach(function(filename) {
    var tag = document.createElement("script");
    tag.src = filename;
    ScriptLoaderDOMContainer.appendChild(tag);
})

// Logging.
console.log("loader.js: scripts loaded");