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

loadData('/lpc-versions/lpc-new.js').then((data) => {
    lpcNew = data.toString();
    loadData('/lpc-versions/lpc-old.js').then((data) => {
        lpcOld = data.toString();
        console.log(lpcNew.length);
        console.log(lpcOld.length);
        getDiffs();
    }).catch(ex => {
        console.log(ex);
    });
}).catch(ex => {
    console.log(ex);
});

function getDiffs() {
    var diff = jsdiff.diffChars(lpcNew, lpcOld);
    var result = JSON.stringify(diff);
    console.log(result.length);
    console.log(result);
    /*
    diff.forEach(function(part){
      // green for additions, red for deletions
      // grey for common parts
      var color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';
      process.stderr.write(part.value[color]);
    }); */
}
