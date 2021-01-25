var express = require("express");
const search = require("./search");
const connect = require("./connect");
var app = express();

app.get("/search", async function(req, res, next) {
  result = await search.run(req.query);
  res.json(result);
 });
 
app.listen(3000, async function() {
 console.log("Server running on port 3000");
});