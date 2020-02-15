const parser = require("./api/parser");
const io = require("./api/io");
const express = require("express");
var app = express();
var port = process.env.PORT || 3000;

var cache = io.readCache();

app.get("/", function(req, res) {
    res.send("ScottyLabs CourseAPI Homepage");
});

app.get("/semester/:semester", function(req, res) {
    io.updateCache(cache);
    var semester = req.params.semester;
    console.log("Requested semester: " + semester);
    res.writeHead(200, {"content-type": "application/json"});
    res.end(parser.getSemesterData(semester));
});

app.get("/query", function(req, res) {
    io.updateCache(cache);
    var query = req.query;
});

console.log("App listening on port " + port);
app.listen(port);