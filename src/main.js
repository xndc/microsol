/* This is the entry point of the game, sort of. The real one is loader.js. In any case, this file
   assumes it's loaded after all the others. */

/* First, some background on Solitaire (Patience, for those who want to follow along on Wikipedia).
   The board has four sections we care about:
   - the stock, which is the pile in which cards that haven't been dealt are put face-down. You can
     take one or three cards from it and place them in the waste pile by clicking on it.
   - the waste, which is the pile cards you take from the stock are put in. You can drag the top-
     most card from the waste anywhere.
   - the 4 foundation piles, where you have to stack cards from A to K on top of each other (K is
     the last). All cards in a stack must have the same suit. The game ends when you have four
     complete stacks here.
   - the 7 tableau piles, where cards are placed at the start of the game. Cards in the tableau
     piles can be face-down or face-up; face-down cards must be located below face-up ones. The
     face-up cards must additionally be of alternating colours and consecutive numbers (higher ones
     above). If a face-down card is the topmost one in a pile, it can be flipped. If a pile is
     empty, a K card of any suit can be dragged into the spot. The nth tableau pile (numbering from
     1) should contain (n-1) face-down cards and one face-up card at the start of the game.
   
   Next, some background on SOL.EXE. All numbers are in pixels, and coords as (X, Y) with  X
   being left to right and Y top to bottom:
   - The window size is 585 x 367. This is currently specified in index.html on the <canvas> tag.
   - Each card is 71 x 93.
   - The horizontal spacing between cards (and the window edge) is 11.
   - The vertical spacing between the top row (stock/waste/foundation) and the tableau is 6.
   - The vertical spacing between face-down cards in the tableau (and the first face-up one) is 3.
   - The vertical spacing between face-up cards in the tableau is 15.
   - Cards in the foundations are stacked on top of one another with no spacing.
   - The stock starts drawing at (11, 6).
   - The waste starts drawing at (93, 6).
   - The foundations start drawing at (257, 6).
   - The tableau starts drawing at (11, 111).
   - TODO: stock stacking, draw-3 mode, etc.
*/

/* Note that a lot of the game logic is in events.js. */

// Misc. constants.
// TODO: turn all the hardcoded sizes in this file and events.js into constants.
const CARD_W = 71;
const CARD_H = 93;

// Canvas and context.
var Canvas, Context;

// Settings constants.
// The main <canvas> element's ID.
const sCanvasID = "canvas";

// Settings variables.
// Background colour, should be an HTML colour code.
var sBackgroundColor = "#008000";
// The chosen card back's number (from 0 to 11).
var iCardbackNumber = 10;
// The double-click delay used in events.js.
var iDoubleClickDelay = 250;

// State variables for the various cards we need to keep track of.
var aStock           = [];
var aWaste           = [];
var aFoundations     = [[], [], [], []];
var aTableauFaceDown = [[], [], [], [], [], [], []];
var aTableauFaceUp   = [[], [], [], [], [], [], []];

// State variables for handling card grabbing.
// Either one or multiple cards can be grabbed.
const GRAB_STATE_NONE     = 0;
const GRAB_STATE_SINGLE   = 1;
const GRAB_STATE_MULTIPLE = 2;
var iGrabState = GRAB_STATE_NONE;
// This should be the number (1 to 52) of the grabbed card in single mode.
var iGrabCard  = 0;
// This should contain the grabbed card numbers in multiple mode, ordered in exactly the same way
// they would be if stored in the tableau arrays.
var aGrabCards = [];
// This should be a reference to whichever array the card was initially taken from, so it can be
// put back there if it doesn't end up somewhere else.
var pGrabSrc   = null;
// The grabbed card(s) should be drawn starting at the coordinates stored here.
var iGrabX     = 0;
var iGrabY     = 0;

// Set to true when the game has been won.
var bGameWon = false;

// Whether to redraw the game on the next frame. This needs to be manually set to true whenever we
// affect the game state, which is a bit annoying for debugging. Maybe look into adding a button.
var bRedrawRequired = true;

// Initial load.
window.onload = function() {
    // Get the canvas and 2D context global objects.
    console.log("main.js: loading");
    Canvas  = document.getElementById(sCanvasID);
    Context = Canvas.getContext("2d");

    // Attach the requisite event handlers.
    Canvas.addEventListener("mousedown",  OnMouseDown);
    Canvas.addEventListener("touchstart", OnMouseDown);
    Canvas.addEventListener("mousemove",  OnMouseMove);
    Canvas.addEventListener("touchmove",  OnMouseMove);
    Canvas.addEventListener("mouseup",    OnMouseUp);
    Canvas.addEventListener("touchend",   OnMouseUp);

    // Check to see if we have state saved in LocalStorage.
    var savedStateJSON = window.localStorage.getItem("savedState");
    if (savedStateJSON) {
        // Grab all the state variables.
        // TODO: error checking, make sure none of these are undefined.
        var savedState   = window.JSON.parse(savedStateJSON);
        aStock           = savedState.aStock;
        aWaste           = savedState.aWaste;
        aFoundations     = savedState.aFoundations;
        aTableauFaceDown = savedState.aTableauFaceDown;
        aTableauFaceUp   = savedState.aTableauFaceUp;
        iCardbackNumber  = savedState.iCardbackNumber || iCardbackNumber;
    } else {
        // Deal the cards. Function defined at bottom of this file.
        Deal();
    }

    // Start the game loop.
    console.log("main.js: starting event loop");
    window.requestAnimationFrame(GameLoop);
}

// Event loop.
function GameLoop() {
    // Optimization: this is a mostly static game, so we don't really need to redraw the canvas on
    // every frame. bRedrawRequired should be set to true by the various event handlers we use.
    if (bRedrawRequired) {
        // Reset bRedrawRequired and start a redraw.
        bRedrawRequired = false;
        // We'll run GameRedraw if the game is still being played, or GameWinRedraw if the game has
        // been won and we need to draw the win animation. Note that GameRedraw should run at least
        // once per session.
        if (bGameWon) {
            GameWinRedraw();
        } else {
            GameRedraw();
        }
    }
    // Keep the game loop running. Unlike a native game, we don't have to worry about stopping.
    window.requestAnimationFrame(GameLoop);
}

// Redraws the game.
function GameRedraw() {
    // Save state, but only if we don't have any cards grabbed.
    if (iGrabState === GRAB_STATE_NONE) {
        var savedState = {
            "aStock":           aStock,
            "aWaste":           aWaste,
            "aFoundations":     aFoundations,
            "aTableauFaceDown": aTableauFaceDown,
            "aTableauFaceUp":   aTableauFaceUp,
            "iCardbackNumber":  iCardbackNumber,
        };
        window.localStorage.setItem("savedState", window.JSON.stringify(savedState));
    }

    // Check to see if the game has been won.
    if (!bGameWon) {
        bGameWon = true;
        for (var i = 0; bGameWon && (i < 4); i++) {
            if (aFoundations[i].length !== 13) {
                bGameWon = false;
            }
        }
        if (bGameWon) {
            console.log("main.js: you won the game!");
        }
    }

    // Draw the background.
    Context.fillStyle = sBackgroundColor;
    Context.fillRect(0, 0, Canvas.width, Canvas.height);

    // Grab the empty stock, empty foundation and cardback images.
    var EmptyStockImage      = Images["deck-blank"];
    var EmptyFoundationImage = Images["foundation-blank"];
    var CardbackImage        = Images["deck-" + String(iCardbackNumber)];

    // Draw the stock (or empty stock background) at (11, 6).
    if (aStock.length > 0) {
        // An image should be drawn for each 10 cards in the stock.
        // The X and Y offsets for each image are 2 and 1 respectively.
        var drawSteps = Math.ceil(aStock.length / 10);
        for (var i = 0; i < drawSteps; i++) {
            Context.drawImage(CardbackImage, 11 + (2 * i), 6 + i);
        }
    } else {
        Context.drawImage(EmptyStockImage, 11, 6);
    }

    // Draw cards in the waste pile, if applicable, starting at (93, 6).
    if (aWaste.length > 0) {
        // Get the top card.
        var CardIndex = aWaste[aWaste.length - 1];
        var CardImage = GetCardImage(CardIndex);
        // The same kind of padding we use for the stock applies here as well.
        var drawSteps = Math.ceil(aWaste.length / 10);
        for (var i = 0; i < drawSteps; i++) {
            Context.drawImage(CardImage, 93 + (2 * i), 6 + i);
        }
    }

    // Draw cards in the foundation piles, if applicable, starting at (257, 6). Draw the foundation
    // background if there aren't any cards in a pile.
    for (var i = 0; i < 4; i++) {
        // 82 is the card length (71) plus spacing (11).
        var drawX = 257 + (i * 82);
        var pile  = aFoundations[i];
        if (pile.length > 0) {
            // Get and draw the card's image.
            var CardIndex = pile[pile.length - 1];
            var CardImage = GetCardImage(CardIndex);
            Context.drawImage(CardImage, drawX, 6);
        } else {
            // Draw the background.
            Context.drawImage(EmptyFoundationImage, drawX, 6);
        }
    }

    // Draw cards in the tableau piles, starting at (11, 111).
    for (var i = 0; i < 7; i++) {
        // Same thing with the offset here as for the foundations.
        var drawX = 11 + (i * 82);
        // This offset gets incremented as we draw cards.
        var drawY = 111;
        
        // Draw the face-down cards, incrementing the Y offset by 3 for each.
        var dpile = aTableauFaceDown[i];
        for (var j = 0; j < dpile.length; j++) {
            Context.drawImage(CardbackImage, drawX, drawY);
            drawY += 3;
        }

        // Draw the face-up cards, incrementing the Y offset by 15 for each.
        var upile = aTableauFaceUp[i];
        for (var j = 0; j < upile.length; j++) {
            // Get and draw the card's image.
            var CardIndex = upile[j];
            var CardImage = GetCardImage(CardIndex);
            Context.drawImage(CardImage, drawX, drawY);
            drawY += 15;
        }
    }

    // Draw the grabbed card(s) if applicable.
    // Multiple cards are drawn with 15px of space between them.
    switch (iGrabState) {
        case GRAB_STATE_SINGLE:
            Context.drawImage(GetCardImage(iGrabCard), iGrabX, iGrabY);
            break;
        case GRAB_STATE_MULTIPLE:
            for (var i = 0; i < aGrabCards.length; i++) {
                var card = aGrabCards[i];
                Context.drawImage(GetCardImage(card), iGrabX, iGrabY + (15 * i));
            }
    }
}

// Deal the cards.
function Deal() {
    // Reset all the state arrays.
    aStock           = [];
    aWaste           = [];
    aFoundations     = [[], [], [], []];
    aTableauFaceDown = [[], [], [], [], [], [], []];
    aTableauFaceUp   = [[], [], [], [], [], [], []];
    // Grab a huge pile of random cards and put them in the stock.
    aStock = UtilShuffle(UtilRange(1, 52));
    // Draw cards for the tableau piles.
    for (var i = 0; i < 7; i++) {
        // Grab the face-down cards from the stock, i per pile.
        for (var j = 0; j < i; j++) {
            aTableauFaceDown[i].push(aStock.pop());
        }
        // Grab a face-up card from the stock.
        aTableauFaceUp[i].push(aStock.pop());
    }
    // Set the redraw and win flags.
    bRedrawRequired = true;
    bGameWon        = false;
}

// Switch to the next cardback. Called from an <a> tag in index.html.
function NextCardback() {
    iCardbackNumber++;
    if (iCardbackNumber > 11) {
        iCardbackNumber = 0;
    }
    bRedrawRequired = true;
}

// Redraw function for the win animation.
// I actually have no idea how to implement this.
// See view-source:http://mrdoob.com/lab/javascript/effects/solitaire/ for pointers maybe, though
// it's not entirely accurate.
var iWinFrameskip  = 2; // Frames to skip beween each position increment.
var iWinFoundation = 0; // Foundation of the card currently being animated.
var iWinCardIndex  = 0; // Index of the card within the foundation.
var iWinPosX       = 0; // X position to draw the card at.
var iWinPosY       = 0; // Y position to draw the card at.
var iWinFrameskipC = 0; // Frameskip counter state variable.
function GameWinRedraw() {
    if (iWinFrameskipC === 0) {
        iWinFrameskipC = iWinFrameskip;
    } else {
        iWinFrameskipC--;
    }
}