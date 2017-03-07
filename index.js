var jsdiff = require('diff');
require('colors')
var fs = require('fs');

var lpcNew = 'beep boop';
var lpcOld = 'beep boob blah';

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

loadData('/lpc-versions/lpc-new2.js').then((data) => {
    lpcNew = data.toString();
    loadData('/lpc-versions/lpc-old2.js').then((data) => {
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
    console.log("--- diff by char ------");
    console.log("----------------------------");
    var diff = jsdiff.diffChars(lpcOld, lpcNew);
    var result = JSON.stringify(diff);
    console.log("patch size: " + result.length);
    displayDiffs(diff);

    console.log();
    console.log("--- diff by word ------");
    console.log("----------------------------");
    diff = jsdiff.diffWords(lpcOld, lpcNew);
    result = JSON.stringify(diff);
    console.log("patch size: " + result.length);
    displayDiffs(diff);
    
    console.log();
    console.log("----------------------------");
    console.log("----------------------------");
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
