// Creates a list containing integers from start to end.
// http://stackoverflow.com/questions/3895478/
function UtilRange (start, end) {
    if (end == start) {
        return [start];
    }
    var reverse = false;
    if (end < start) {
        reverse = true;
        var t = start;
        start = end;
        end   = t;
    }
    var a = Array.apply(null, Array(Math.abs(end - start) + 1)).map(function(_, i) {
        return i + start;
    });
    if (reverse) {
        return a.reverse();
    }
    return a;
}

// Shuffles an array using the Fisher-Yates algorithm.
// http://bost.ocks.org/mike/shuffle/
function UtilShuffle (A) {
    var Index = A.length;
    while (Index > 0) {
        var RandomIndex = Math.floor(Math.random() * Index);
        Index--;
        var Temp = A[Index];
        A[Index] = A[RandomIndex];
        A[RandomIndex] = Temp;
    }
    return A;
}

// Checks to see if the given X, Y coords are inside the given bX, bY, bW, bH box.
function UtilCheckCollision (X, Y, bX, bY, bW, bH) {
    if (X < bX)      return false;
    if (X > bX + bW) return false;
    if (Y < bY)      return false;
    if (Y > bY + bH) return false;
    return true;
}

// Retrieves a string from LocalStorage. Like window.localStorage.getItem, but returns undefined if
// LocalStorage is unavailable instead of throwing an exception.
function UtilLocalStorageGetItem (key) {
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        return undefined
    }
}

// Stores a string in LocalStorage. Like window.localStorage.setItem, but ignores exceptions.
function UtilLocalStorageSetItem (key, value) {
    try {
        return window.localStorage.setItem(key, value);
    } catch (e) {}
}