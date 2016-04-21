/* Helpers for dealing with cards.
   Each card is represented as an integer from 1 to 52, split into 4 ranges (one for each suit):
   - clubs:     1 to 13
   - diamonds: 14 to 26
   - hearts:   27 to 39
   - spades:   40 to 52
   Each range contains the cards A, 2 through 10, J, Q and K in this order. */

// Global constants for suits.
const SUIT_CLUBS    = 0;
const SUIT_DIAMONDS = 1;
const SUIT_HEARTS   = 2;
const SUIT_SPADES   = 3;

// Global constants for card numbers.
const CARD_A  = 1;
const CARD_2  = 2;
const CARD_3  = 3;
const CARD_4  = 4;
const CARD_5  = 5;
const CARD_6  = 6;
const CARD_7  = 7;
const CARD_8  = 8;
const CARD_9  = 9;
const CARD_10 = 10;
const CARD_J  = 11;
const CARD_Q  = 12;
const CARD_K  = 13;

// Global constants for colours.
const COLOR_RED   = 0;
const COLOR_BLACK = 1;

// Check that the given card number is within the valid range.
function CheckCard (card) {
    return (
        (typeof(card) === "number") &&
        (card > 0) &&
        (card < 53))
}

// Exception-throwing version of CheckCard. 
function AssertCard (card) {
    if (!CheckCard(card)) {
        throw new Error("card.js/AssertCard: given object is not a valid card number: " +
            String(card));
    }
}

// Get the suit number of a card (from 0 to 3).
function GetCardSuit (card) {
    AssertCard(card);
    return Math.floor((card - 1) / 13);
}

// Get the number of a card (from 1 to 13).
function GetCardNum (card) {
    AssertCard(card);
    return ((card - 1) % 13) + 1;
}

// Get the colour of a card (0 for red or 1 for black).
function GetCardColor (card) {
    var suit = GetCardSuit(card);
    if (suit === SUIT_CLUBS || suit === SUIT_SPADES) {
        return COLOR_BLACK;
    } else {
        return COLOR_RED;
    }
}

// Get the image element corresponding to a card.
function GetCardImage (card) {
    AssertCard(card);
    if (typeof(Images) !== "object") {
        throw new Error("card.js/GetCardImage: 'Images' is not a global object");
    }

    // Get the correct key for the card's image in Images.
    var key = "card-" + String(card);
    if (!(Images.hasOwnProperty(key))) {
        throw new Error("card.js/GetCardImage: no image found for key " + key);
    }

    // Return the image.
    return Images[key];
}