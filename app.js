var fs = require('fs');
var checksum = require('checksum');
require('colors');
var beautify = require('js-beautify').js_beautify;
var present = require('present');

var lpcNew = '';
var lpcOld = '';

//var newLpcName = "/lpc-versions/lpc-new20.js";
//var oldLpcName = "/lpc-versions/lpc-old20.js";

var newLpcName = '/lpc-versions/lpc-30-02.js';
var oldLpcName = '/lpc-versions/lpc-23-02.js';

var fileToWriteTo = '/converted/lpc-converted.txt';
var dictionaryToWriteTo = '/converted/lpc-dic.txt';

var indent = 0;

//console.log(JSON.stringify(createPatch("ab22atttb", "abzbcabttt2")));
//console.log(JSON.stringify(createPatch("allbczppzq2", "alblczppz24q2ab")));

patchProcess("ab22atttb", "abzbcabttt2");
patchProcess("allbczppzq2", "alblczppz24q2ab");

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
    //patchProcess(lpcOld, lpcNew);
    calculateWordWeight(lpcNew);
}

var indexSearchUniqueStrings = 0;
function getUniqueStr(str) {
    while (true) {
        var pair = String.fromCharCode(48 + Math.floor(indexSearchUniqueStrings / 74), 48 + (indexSearchUniqueStrings % 74));

        if (str.indexOf(pair) === -1) {
            console.log('FOUND --- > ' + pair);
            indexSearchUniqueStrings++;
            return pair;
        }
        indexSearchUniqueStrings++;
    }
}

function optimizeDictionary(wordDictionary) {
    var str = "";
    Object.keys(wordDictionary).forEach(key => {
        str += key+","+wordDictionary[key]+",";
    });

    return str;
}

function calculateWordWeight(str) {
    console.log("------------->>>> analizying word usage");
    var arrayOfWords = lpcNew.split(/\W+/);
    var dictionary = {};
    for (var i = 0; i < arrayOfWords.length; i++) {
        dictionary[arrayOfWords[i]] = 0;
    }
    arrayOfWords.forEach(element => {
        dictionary[element]++;
    });

    var keyArray = Object.keys(dictionary);
    keyArray.sort((a, b) => {
        if (a.length <= 2) {
            return -1;
        }

        if (b.length - 2 <= 2) {
            return 1;
        }

        if ((a.length - 2) * dictionary[a] < (b.length - 2) * dictionary[b]) {
            return -1;
        }

        return 1;
    });

    var wordDictionary = {};

    //var totalSaved = 0;
    keyArray.forEach(elem => {
        if (elem.length <= 2) {
            return;
        }

        var saved = calculateRealSave(elem, dictionary[elem]);
        if (saved > 0) {
            wordDictionary[elem] = getUniqueStr(str);
            //totalSaved += saved;
            console.log(`for word >>> ${elem} >>> count: ${dictionary[elem]} >>> saved: ${calculateRealSave(elem, dictionary[elem]) / 1000} Kb;`);
        } else {
            // console.log(`[SKIPPING] word >>> ${elem} >>> count: ${dictionary[elem]} >>> value (2char replacement): ${calculateRealSave(elem, dictionary[elem])};`);
        }
    });

    console.log("lpc size (before): " + str.length / 1000 + " Kb");

    Object.keys(wordDictionary).forEach(key => {
        str = str.replace(new RegExp(key, 'g'), wordDictionary[key]);
    });

    console.log("word dictionary size (non-optimized): " + JSON.stringify(wordDictionary).length / 1000 + " Kb");
    console.log("word dictionary size (optimized): " + optimizeDictionary(wordDictionary).length / 1000 + " Kb");
    console.log("lpc size: " + str.length / 1000 + " Kb");
    writeToFile(fileToWriteTo, str);
    writeToFile(dictionaryToWriteTo, JSON.stringify(wordDictionary));
    console.log("------------------->>>>>>>>>>");
    // console.log(`------------------->>>>>>>>>> total saved: ${totalSaved / 1000} Kb`);
}

function writeToFile(filePath, str) {
    fs.writeFile(__dirname + filePath, str, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
}

function calculateRealSave(element, count) {
    return (element.length - 2) * count - element.length - 5 - 2;
}

function createPatch(oldString, newString, substringSize = 1) {
    var t0 = present();
    var proccessDictionary = {};
    var currentMilestion = 1;
    var currentMinute = 1;
    var patch = [];
    var iOld = 0, iNew = 0;
    var countTheSame = 0;
    var originalOldSize = oldString.length;
    while (iOld < oldString.length && iNew < newString.length) {
        if (originalOldSize - oldString.length > currentMilestion * originalOldSize / 20 && proccessDictionary[currentMilestion.toString()] === undefined) {
            proccessDictionary[currentMilestion.toString()] = 1;
            console.log(`-------> ${currentMilestion * 5}% completed; patch size: ${JSON.stringify(patch).length / 1000} kb; minimized patch size: ${smallifyPatch(patch).length / 1000} kb; time: ${(present() - t0) / 60000} minutes`);
            currentMilestion++;
        }

        if ((present() - t0) / 60000 > currentMinute) {
            console.log(`-> time passed ${currentMinute} minutes; ${Math.floor((originalOldSize - oldString.length) * 100 / originalOldSize)}% completed; patch size: ${JSON.stringify(patch).length / 1000} kb; minimized patch size: ${smallifyPatch(patch).length / 1000} kb;`);
            currentMinute++;
        }

        if (oldString[iOld] === newString[iNew]) {
            countTheSame++;
            iOld++;
            iNew++;
        } else {
            if (countTheSame != 0) {
                patch.push({ c: countTheSame });
                countTheSame = 0;
                if (iNew > 1000) {
                    newString = newString.substring(iNew, newString.length);
                    iNew = 0;
                }

                if (iOld > 1000) {
                    oldString = oldString.substring(iOld, oldString.length);
                    iOld = 0;
                }
            }

            var stringToSearchFor = iOld === oldString.length - substringSize + 1 ? oldString[iOld] : oldString.substring(iOld, iOld + substringSize);
            var firstFindInNewStringIndex = newString.indexOf(stringToSearchFor, iNew);
            if (firstFindInNewStringIndex === -1) {
                firstFindInNewStringIndex = newString.length;
            }

            var maxValue = Math.min(oldString.length - iOld, firstFindInNewStringIndex - iNew);
            foundSmallerDiff = false;
            var minIndexInOldString = Number.MAX_VALUE;
            for (var i = 0; i < maxValue; i++) {
                stringToSearchFor = i + iNew === newString.length - substringSize + 1 ? newString[i + iNew] : newString.substring(i + iNew, i + iNew + substringSize);
                var newIndex = oldString.indexOf(stringToSearchFor, iOld);
                if (newIndex !== -1 && newIndex - iOld < firstFindInNewStringIndex - iNew) {
                    minIndexInOldString = Math.min(newIndex, minIndexInOldString);
                    foundSmallerDiff = true;
                }
            }

            if (foundSmallerDiff === false) {
                patch.push({ a: newString.substring(iNew, firstFindInNewStringIndex) });
                iNew = firstFindInNewStringIndex;
                if (iNew > 1000) {
                    newString = newString.substring(firstFindInNewStringIndex, newString.length);
                    iNew = 0;
                }
            } else {
                patch.push({ r: minIndexInOldString - iOld });
                iOld = minIndexInOldString;
                if (iOld > 1000) {
                    oldString = oldString.substring(minIndexInOldString, oldString.length);
                    iOld = 0;
                }
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

    var t1 = present();
    console.log(`--- time spent in patch: ${(t1 - t0) / 1000} seconds`);
    // return smallifyPatch(patch);
    return patch;
}

function smallifyPatch(patch) {
    var compactText = "";
    patch.forEach(item => {
        if (item.a != null) {
            compactText += "a" + item.a + ",";
        } else if (item.c != null) {
            compactText += "c" + item.c + ",";
        } else if (item.r != null) {
            compactText += "r" + item.r + ",";
        }
    });

    return compactText;
}

function applyPatch(oldString, patch) {
    var i = 0;
    var newString = "";
    while (i < oldString.length) {
        patch.forEach(item => {
            if (item.a != null) {
                newString += item.a;
            } else if (item.c != null) {
                newString += oldString.substring(i, i + item.c);
                i += item.c;
            } else if (item.r != null) {
                i += item.r;
            }
        });

        return newString;
    }
}

function colorifyPatch(oldString, patch) {
    var i = 0;
    while (i < oldString.length) {
        patch.forEach(item => {
            if (item.a != null) {
                process.stderr.write(item.a.green);
            } else if (item.c != null) {
                var newstring = oldString.substring(i, i + item.c);
                i += item.c;
                process.stderr.write(newstring.grey);
            } else if (item.r != null) {
                var toRemove = oldString.substring(i, i + item.r);
                process.stderr.write(toRemove.red);
                i += item.r;
            }
        });
    }
}

function patchProcess(oldString, newString) {
    console.log();
    console.log("--- diff ------");
    console.log("----------------------------");

    var diff = createPatch(oldString, newString, 1);
    var result = JSON.stringify(diff);
    console.log("patch size: " + result.length);
    console.log("applying patch..");
    console.log("new string size: " + newString.length);
    var patchedOldString = applyPatch(oldString, diff);
    console.log("old string + patch size: " + patchedOldString.length);
    console.log("are the 2 eq? " + (checksum(patchedOldString) === checksum(newString)));
    colorifyPatch(oldString, diff);
    console.log();
    if (result.length > 1000) {
        console.log("--- the patch is too long to show; hiding the patch");
    } else {
        console.log(result);
    }

    console.log("----------------------------");
    console.log("minified patch size: " + smallifyPatch(diff).length);
    console.log("----------------------------");
    console.log();
}
