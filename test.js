var present = require('present');
var fs = require('fs');

var newLpcName = "/lpc-versions/lpc-new.js";

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

loadData(newLpcName).then(text => {
    var toSearchFor = "PERSONA_CARD_TEMPLATE_READY";
    var index = text.indexOf(toSearchFor);
    var t0 = present();
    text.indexOf(toSearchFor, index - 1);
    console.log("time: " + (present() - t0));
    t0 = present();
    toSearchFor.indexOf(toSearchFor, 0);
    console.log("time: " + (present() - t0));
}).catch(ex => {
    console.log(ex);
});