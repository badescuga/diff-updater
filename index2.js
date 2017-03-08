var jsdiff = require('diff');
require('colors')
var beautify = require('js-beautify').js_beautify;
var fs = require('fs');

var lpcNew = '';
var lpcOld = '';

var newLpcName = "/lpc-versions/lpc-new.js";
var oldLpcName = "/lpc-versions/lpc-old.js";

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
    lpcNew = beautify(data.toString(), { indent_size: indent });
    loadData(oldLpcName).then((data) => {
        lpcOld = beautify(data.toString(), { indent_size: indent });
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
    // console.log("--- diff by patch ------");
    // console.log("----------------------------");
    // var diff = jsdiff.createPatch("lpc-patch", lpcOld, lpcNew, "old-header", "new-header");
    // var result = JSON.stringify(diff);
    // console.log("patch size: " + result.length);

    console.log();
    console.log("--- diff by lines ------");
    console.log("----------------------------");
    var diff = jsdiff.diffLines(lpcOld, lpcNew);
    var result = JSON.stringify(diff);
    console.log("patch size: " + result.length);

    console.log(result);
}

function compactDiff(diff) {
    var array = [];
    diff.forEach(function (part) {
        // green for additions, red for deletions
        // grey for common parts
        var newPart = {};
        if (!part.removed) {
            if (part.added) {
                newPart.a = part.value;
            } else {
                newPart.n = part.value.length; // let me know how many chars everything is not changed
            }
        } else {
            newPart.r = part.count;
        }
        array.push(newPart);
    });

    return array;
}

function displayDiffs(diff) {
    diff.forEach(function (part) {
        // green for additions, red for deletions
        // grey for common parts
        var color = part.added ? 'green' :
            part.removed ? 'red' : 'grey';
        process.stderr.write(part.value[color]);
    });
}
