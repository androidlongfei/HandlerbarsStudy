var fs = require("fs");
var handlebars = require("handlebars");

var source = fs.readFileSync("./template.html", "utf8");
var template = handlebars.compile(source);
var data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
var result = template(data);

fs.writeFileSync('report.html', result);