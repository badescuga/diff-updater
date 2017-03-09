var fs = require('fs');

var lpcNew = '';
var lpcOld = '';

var newLpcName = "/lpc-versions/lpc-new80.js";
var oldLpcName = "/lpc-versions/lpc-old80.js";

var indent = 0;

function loadData(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + path, function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

loadData(newLpcName).then((data) => {
    lpcNew = data.toString();
    loadData(oldLpcName).then((data) => {
        lpcOld = data.toString();
        console.log("old card size: " + lpcOld.length);
        console.log("new card size: " + lpcNew.length);
        getDiffs();
    }).catch(ex => {
        console.log(ex);
    });
}).catch(ex => {
    console.log(ex);
});

function getDiffs() {
    console.log();
    console.log("--- diff ------");
    console.log("----------------------------");
    var diff = createPatch(lpcOld, lpcNew);
    var result = JSON.stringify(diff);
    console.log("patch size: " + result.length);

    console.log(result);
}

function createPatch(oldString, newString) {
    var patch = [];
    var iOld = 0, iNew = 0;
    var countTheSame = 0;
    while (iOld < oldString.length && iNew < newString.length) {
        if (oldString[iOld] === newString[iNew]) {
            countTheSame++;
            iOld++;
            iNew++;
        } else {
            if (countTheSame != 0) {
                patch.push({ c: countTheSame });
                countTheSame = 0;
            }

            var firstFindInNewStringIndex = newString.indexOf(oldString[iOld], iNew);
            if (firstFindInNewStringIndex === -1) {
                firstFindInNewStringIndex = newString.length;
            }

            var maxValue = Math.min(oldString.length - iOld,firstFindInNewStringIndex - iNew);
            foundSmallerDiff = false;
            var minIndexInOldString = Number.MAX_VALUE;;
            for (var i = 0; i < maxValue; i++) {
                var c = newString[i + iNew];
                var newIndex = oldString.indexOf(c, iOld);
                if (newIndex !== -1 && newIndex - iOld < firstFindInNewStringIndex - iNew) {
                    minIndexInOldString = Math.min(newIndex, minIndexInOldString);
                    foundSmallerDiff = true;
                }
            }

            if (foundSmallerDiff === false) {
                patch.push({ a: newString.substring(iNew, firstFindInNewStringIndex) });
                iNew = firstFindInNewStringIndex;
            } else {
                patch.push({ r: minIndexInOldString - iOld });
                iOld = minIndexInOldString;
            }
        }
    }

    if (countTheSame != 0) {
        patch.push({ c: countTheSame });
    }

    if (iOld < oldString.length) {
        patch.push({ r: oldString.length - iOld });
    }

    if (iNew < newString.length) {
        patch.push({ a: newString.substring(iNew) });
    }

    return patch;
}

console.log(JSON.stringify(createPatch("ab22atttb","abzbcabttt2")));
console.log(JSON.stringify(createPatch("allbczppzq2","alblczppz24q2ab")));