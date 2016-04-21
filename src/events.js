/* This file contains all the DOM event handlers used by the game, as well as quite a bit of logic.
   It relies on a bunch of variables in main.js, so check that out first. */

// State variables for keeping track of mouse movement.
var iMouseLastX     = 0;
var iMouseLastY     = 0;
var iMouseLastClick = 0;

// Handles mouse and touch down events.
function OnMouseDown (event) {
    // Stop the annoying selection behaviour.
    event.preventDefault();

    // Set the redraw flag whatever happens here, at least for now.
    bRedrawRequired = true;

    // Liaise with Satan -- sorry, the DOM -- to get the actual data we need from the event.
    var X, Y;
    if (event.touches) {
        X = event.touches[0].pageX;
        Y = event.touches[0].pageY;
    } else {
        var boundingClientRect = Canvas.getBoundingClientRect();
        X = event.clientX - boundingClientRect.left;
        Y = event.clientY - boundingClientRect.top;
    }

    // Set the last mouse positions.
    iMouseLastX = X;
    iMouseLastY = Y;

    // If iGrabState is set, the user probably moved their mouse outside the window or something
    // and we're getting this event because the DOM doesn't bother to fire mouseup events in that
    // case. Remove it from their hand and put it back where it belongs.
    switch (iGrabState) {
        case GRAB_STATE_SINGLE:
            pGrabSrc.push(iGrabCard);
            iGrabState = GRAB_STATE_NONE;
            break;
        case GRAB_STATE_MULTIPLE:
            for (var i = 0; i < aGrabCards.length; i++) {
                pGrabSrc.push(aGrabCards[i]);
            }
            iGrabState = GRAB_STATE_NONE;
            break;
    }

    // Check to see if this click was actually a double-click.
    // TODO: is there any chance of conflicting with OnMouseUp or do event handlers all run
    // synchronously?
    var now = window.performance.now();
    if (now - iMouseLastClick <= iDoubleClickDelay) {
        // Go through the waste and tableau to see which card has been double-clicked.
        var card = 0;
        var src  = null;
        if (aWaste.length > 0 && UtilCheckCollision(X, Y, 93, 6, 71, 93)) {
            card = aWaste.pop();
            src  = aWaste;
        }
        for (var i = 0; ((card === 0) && (i < 7)); i++) {
            var faceUp   = aTableauFaceUp[i];
            var faceDown = aTableauFaceDown[i];
            var topCardX = 11 + (i * 82);
            var topCardY = 111 + (faceDown.length * 3) + ((faceUp.length - 1) * 15);
            if (faceUp.length > 0 && UtilCheckCollision(X, Y, topCardX, topCardY, 71, 93)) {
                card = faceUp.pop();
                src  = faceUp;
            }
        }
        // If a card has been double-clicked, try to place it in one of the foundations.
        if (card !== 0) {
            for (var i = 0; ((card !== 0) && (i < 4)); i++) {
                var pile = aFoundations[i];
                if (pile.length > 0) {
                    var topCard = pile[pile.length - 1];
                    if ((GetCardSuit(card) === GetCardSuit(topCard)) &&
                        (GetCardNum(card) === GetCardNum(topCard) + 1))
                    {
                        pile.push(card);
                        card = 0;
                    }
                } else if (GetCardNum(card) === CARD_A) {
                    pile.push(card);
                    card = 0;
                }
            }

            // If it still hasn't been placed yet, put it back in the array it came from.
            if (card !== 0) {
                src.push(card);
            }
        }
    }
    iMouseLastClick = now;

    // Check to see if the stock has just been clicked.
    // Draw a card to the waste if there are still cards to draw, or push the waste back into the
    // stock pile if not.
    // TODO: this should probably be moved to OnMouseUp or something, so we can let the player
    // change their mind mid-click.
    if (UtilCheckCollision(X, Y, 11, 6, 71, 93)) {
        if (aStock.length > 0) {
            aWaste.push(aStock.pop());
        } else {
            for (var i = aWaste.length - 1; i >= 0; i--) {
                aStock.push(aWaste[i]);
            }
            aWaste = [];
        }
        return;
    }

    // Check to see if the waste has just been clicked. If yes, grab the topmost card.
    if (UtilCheckCollision(X, Y, 93, 6, 71, 93)) {
        if (aWaste.length > 0) {
            // Compute the position of the topmost waste card.
            var drawStep = Math.floor(aWaste.length / 10);
            var cardX = 93 + (2 * drawStep);
            var cardY = 6 + drawStep;
            // Fill out the grab state variables.
            iGrabState = GRAB_STATE_SINGLE;
            iGrabCard  = aWaste.pop();
            pGrabSrc   = aWaste;
            iGrabX     = cardX;
            iGrabY     = cardY;
        }
        return;
    }

    // Check to see if one of the foundation cards has been clicked.
    for (var i = 0; i < 4; i++) {
        var pile = aFoundations[i];
        if (pile.length > 0) {
            var topCard = pile[pile.length - 1];
            var cardX   = 257 + (i * 82);
            var cardY   = 6;
            if (UtilCheckCollision(X, Y, cardX, cardY, 71, 93)) {
                // Fill out the grab state variables.
                iGrabState = GRAB_STATE_SINGLE;
                iGrabCard  = pile.pop();
                pGrabSrc   = pile;
                iGrabX     = cardX;
                iGrabY     = cardY;
                return;
            }
        }
    }

    // Dragging stuff off the tableau is a bit more complicated, because we can grab either one or
    // multiple cards.
    for (var i = 0; i < 7; i++) {
        var faceUp   = aTableauFaceUp[i];
        var faceDown = aTableauFaceDown[i];
        var faceUpX  = 11 + (i * 82);
        var faceUpY  = 111 + (faceDown.length * 3);
        var topCardY = faceUpY + ((faceUp.length - 1) * 15);
        var faceUpH  = topCardY + 93;
        // Length check for the face-up pile.
        if (faceUp.length === 0) {
            // The player may have clicked on a face-down card.
            var topFaceDownCardY = 111 + ((faceDown.length - 1) * 3);
            if (faceDown.length > 0 &&
                UtilCheckCollision(X, Y, faceUpX, topFaceDownCardY, 71, 93))
            {
                // Flip the card.
                faceUp.push(faceDown.pop());
                return;
            }
        } else {
            // Check for collision with the face-up pile.
            if (UtilCheckCollision(X, Y, faceUpX, faceUpY, 71, faceUpH)) {
                if (UtilCheckCollision(X, Y, faceUpX, topCardY, 71, 93)) {
                    // If the topmost card has been clicked, we can just relax and fill out the grab
                    // state variables for a single card.
                    iGrabState = GRAB_STATE_SINGLE;
                    iGrabCard  = faceUp.pop();
                    pGrabSrc   = faceUp;
                    iGrabX     = faceUpX;
                    iGrabY     = topCardY;
                } else {
                    // Figure out specifically which card was clicked.
                    for (var j = 0; j < faceUp.length - 1; j++) {
                        var cardY = faceUpY + (j * 15);
                        if (UtilCheckCollision(X, Y, faceUpX, cardY, 71, 15)) {
                            // Oh shit, Morty, we have a bunch of cards to grab!
                            var cards = [];
                            var l = faceUp.length;
                            for (var k = j; k < l; k++) {
                                cards.push(faceUp.pop());
                            }
                            // Fill the crap out of those state variables, Morty
                            iGrabState = GRAB_STATE_MULTIPLE;
                            aGrabCards = cards.reverse();
                            pGrabSrc   = faceUp;
                            iGrabX     = faceUpX;
                            iGrabY     = cardY;
                        }
                    }
                }
                return;
            }
        }
    }
}

// Handles mouse and touch move events.
function OnMouseMove (event) {
    // We don't care about this event unless bCardGrabbed is true.
    if (iGrabState !== GRAB_STATE_NONE) {
        // Set the redraw flag.
        bRedrawRequired = true;

        // The Satan liaison boilerplate, again.
        var X, Y;
        if (event.touches) {
            X = event.touches[0].pageX;
            Y = event.touches[0].pageY;
        } else {
            var boundingClientRect = Canvas.getBoundingClientRect();
            X = event.clientX - boundingClientRect.left;
            Y = event.clientY - boundingClientRect.top;
        }

        // Compute the mouse position deltas.
        var dX = X - iMouseLastX;
        var dY = Y - iMouseLastY;

        // Set the last mouse positions.
        iMouseLastX = X;
        iMouseLastY = Y;

        // Move the grabbed card appropriately.
        iGrabX += dX;
        iGrabY += dY;
    }
}

// Handles mouse and touch up events.
function OnMouseUp (event) {
    // Set the redraw flag whatever happens here, at least for now.
    bRedrawRequired = true;

    // Would it have been such a bother to have .x and .y properties on the event?
    var X, Y;
    if (event.touches) {
        X = event.touches[0].pageX;
        Y = event.touches[0].pageY;
    } else {
        var boundingClientRect = Canvas.getBoundingClientRect();
        X = event.clientX - boundingClientRect.left;
        Y = event.clientY - boundingClientRect.top;
    }

    // Set the last mouse positions.
    iMouseLastX = X;
    iMouseLastY = Y;

    // If one or more cards have just been dropped, well...
    switch (iGrabState) {
        // If a single card has been dropped, it can be placed either on the tableau or on one of
        // the foundations.
        case GRAB_STATE_SINGLE: {
            // Check against each tableau pile.
            for (i = 0; i < 7; i++) {
                var faceUp   = aTableauFaceUp[i];
                var faceDown = aTableauFaceDown[i];
                // We don't care to separate the faceUp and faceDown piles as far as collision 
                // checking goes, so compute the X and height of the entire tableau pile.
                var pileX = 11 + (i * 82);
                var pileH = (faceDown.length * 3) + (faceUp.length * 15) + 93;

                // There are basically two cases to care about: one, the faceUp pile contain cards,
                // and two, neither pile does. For the former, we do the check-against-top-card
                // dance. For the latter, we only allow K cards to be placed.
                if (UtilCheckCollision(X, Y, pileX, 111, 71, pileH)) {
                    if (faceUp.length > 0) {
                        var topCard = faceUp[faceUp.length - 1];
                        // Check to see if we can drop our card there. It needs to have a different
                        // colour and a number one lower than topCard.
                        if ((GetCardColor(iGrabCard) !== GetCardColor(topCard)) &&
                            (GetCardNum(iGrabCard) === GetCardNum(topCard) - 1))
                        {
                            faceUp.push(iGrabCard);
                            iGrabState = GRAB_STATE_NONE;
                            return;
                        }
                    } else if (faceDown.length === 0) {
                        // Check to see if it's a K card.
                        if (GetCardNum(iGrabCard) === CARD_K) {
                            faceUp.push(iGrabCard);
                            iGrabState = GRAB_STATE_NONE;
                            return;
                        }
                    }
                }
            }

            // Check against each foundation pile.
            for (var i = 0; i < 4; i++) {
                var pile = aFoundations[i];
                // Get the pile's position.
                var pileX = 257 + (i * 82);
                // Collision check.
                if (UtilCheckCollision(X, Y, pileX, 6, 71, 93)) {
                    if (pile.length === 0) {
                        // If the pile is empty, we can only place ace cards there.
                        if(GetCardNum(iGrabCard) === CARD_A) {
                            pile.push(iGrabCard);
                            iGrabState = GRAB_STATE_NONE;
                            return;
                        }
                    } else {
                        // If not, we can only place the card there if it has the same suit and a
                        // number one higher than the topmost card of the pile.
                        var card = pile[pile.length - 1];
                        if ((GetCardSuit(iGrabCard) === GetCardSuit(card)) &&
                            (GetCardNum(iGrabCard) === GetCardNum(card) + 1))
                        {
                            pile.push(iGrabCard);
                            iGrabState = GRAB_STATE_NONE;
                            return;
                        }
                    }
                }
            }

            // If all our checks have failed, just drop the card back to the pile it came from.
            pGrabSrc.push(iGrabCard);
            iGrabState = GRAB_STATE_NONE;
            return;
        } break;

        // If multiple cards have been dropped, they can only be placed on the tableau, so check
        // against that. They can also only be placed if the bottom card of the grab stack is one
        // lower than the tableau's top face-up card.
        case GRAB_STATE_MULTIPLE: {
            for (var i = 0; i < 7; i++) {
                var faceUp   = aTableauFaceUp[i];
                var faceDown = aTableauFaceDown[i];
                // We don't care to separate the faceUp and faceDown piles as far as collision 
                // checking goes, so compute the X and height of the entire tableau pile.
                var pileX = 11 + (i * 82);
                var pileH = (faceDown.length * 3) + (faceUp.length * 15) + 93;

                // Like with GRAB_STATE_SIMPLE, we care about two cases: faceUp non-empty and both
                // empty. We also only care about the bottom-most card in the hand - the checks
                // are identical and have been copy-pasted, actually.
                if (UtilCheckCollision(X, Y, pileX, 111, 71, pileH)) {
                    var card = aGrabCards[0];
                    if (faceUp.length > 0) {
                        var topCard = faceUp[faceUp.length - 1];
                        // Check to see if we can drop our card there. It needs to have a different
                        // colour and a number one lower than topCard.
                        if ((GetCardColor(card) !== GetCardColor(topCard)) &&
                            (GetCardNum(card) === GetCardNum(topCard) - 1))
                        {
                            for (var i = 0; i < aGrabCards.length; i++) {
                                faceUp.push(aGrabCards[i]);
                            }
                            iGrabState = GRAB_STATE_NONE;
                            return;
                        }
                    } else if (faceDown.length === 0) {
                        // Check to see if it's a K card.
                        if (GetCardNum(card) === CARD_K) {
                            for (var i = 0; i < aGrabCards.length; i++) {
                                faceUp.push(aGrabCards[i]);
                            }
                            iGrabState = GRAB_STATE_NONE;
                            return;
                        }
                    }
                }
            }

            // If all our checks have failed, just drop the cards back where they came from.
            for (var i = 0; i < aGrabCards.length; i++) {
                pGrabSrc.push(aGrabCards[i]);
            }
            iGrabState = GRAB_STATE_NONE;
            return;
        } break;
    }
}