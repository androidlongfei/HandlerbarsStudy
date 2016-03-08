var fs = require("fs");
var handlebars = require("handlebars");

var source = fs.readFileSync("./detailReportTemp.html", "utf8");
var template = handlebars.compile(source);
var data = JSON.parse(fs.readFileSync("./data.json", "utf8"));

handlebars.registerHelper("getAttrValue", function (obj,attr,options) {
    return obj[attr];
});

handlebars.registerHelper("getImagePosition", function (rootData,item,options) {
    var sequenceFile = rootData.sequenceFile;
    for(var i=0;i<sequenceFile.length;i++){
        if(sequenceFile[i] === item){
            return i;
        }
    }
    return 0;
});

handlebars.registerHelper("getImageUrl", function (rootData,filePrefix,options) {
    var url = rootData.serverUrl + '/public/' + rootData.taskName + '/' + rootData.taskId + '/output/fig_table/' + filePrefix;
    return url;
});

handlebars.registerHelper("imageGroup", function (rootData, options) {

    var sequenceFile = rootData.sequenceFile;
    console.log('sequenceFile',sequenceFile);
    var samplePrefixGroups = [];

    var groupNum = parseInt(sequenceFile.length / 6) + 1;
    for (var i = 0; i < groupNum; i++) {
        samplePrefixGroups[i] = sequenceFile.slice(6 * i, 6 * i + 6);
    }
    //console.log("sequenceFile:", this);
    //console.log("samplePrefixGroups:", samplePrefixGroups);
    return options.fn(samplePrefixGroups);
});

handlebars.registerHelper("getObjKeyList", function (obj, options) {
    console.log("keylist",obj);
    var keyList = [];
    for(var keyItem in obj){
        keyList.push(keyItem);
    }
    //console.log("key:", keyList);
    return options.fn(keyList);
});

handlebars.registerHelper("getObjValueList", function (obj, options) {
    var valueList = [];
    for(var keyItem in obj){
        valueList.push(obj[keyItem]);
    }
    //console.log("key:", keyList);
    return options.fn(valueList);
});

handlebars.registerHelper("getFirstFromArray", function (obj, options) {
    return options.fn(obj[0]);
});

var result = template(data);

fs.writeFileSync('detailReport.html', result);