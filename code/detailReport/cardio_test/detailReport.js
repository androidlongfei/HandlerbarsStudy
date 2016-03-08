var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var joinJson = require('./lib/joinJson/joinJsonFileObj.js');

var source = fs.readFileSync("./detailReportTemp.html", "utf8");
var template = handlebars.compile(source);

var data = {};
data.workspaceDirectory = "/data/workspace";
data.serverUrl = "http://192.168.5.14:3030";
data.taskName = "cardio";
data.taskId = "8af02470-88da-11e5-bc12-5193afdc4a0c";
//data.localAccessDirectory = data.workspaceDirectory + "/" + data.taskName + "/" + data.taskId + "/output/fig_table";
data.localAccessDirectory = "./output";

//测序文件前缀集合,主要用来获取图片
var inputFileJson = joinJson.getJsonObj(path.join(data.localAccessDirectory, 'input.json'));
//console.log('inputFile',inputFileJson);
var sequenceFile = {};
if (inputFileJson) {
    sequenceFile = inputFileJson.inputFiles.sequenceFile;
    sequenceFile = getSequenceFilePrefix(sequenceFile, data);
    data.sequenceFile = sequenceFile;
}
//console.log('file prefix',data);

//表格json文件
var table = {};
var prefixItem = data.sequenceFile[data.sequenceFile.length - 1];
var tableJsonFileList = ['summary_QC.xls.json', 'summary.information.xls.json', 'summary_SNP_variant_statistics.xls.json',
    'summary_SNP_exonic_statistics.xls.json', 'summary_tstv.xls.json', 'summary_SNP_statistics.xls.json',
    (prefixItem + '_SNP.head_table.xls.json'), 'summary_InDel_variant_statistics.xls.json',
    'summary_InDel_exonic_statistics.xls.json', 'summary_InDel_statistics.xls.json',
    (prefixItem + '_InDel.head_table.xls.json')];
var tableKeyList = ['summaryQC', 'summaryInfo', 'summarySNPVariantStat', 'summarySNPExonicStat', 'summaryTstv', 'summarySNPStat',
    'SNPHeadTable', 'summaryInDelVariantStat', 'summaryInDelExonicStat', 'summaryInDelStat', 'InDelHeadTable'];
for (var i = 0; i < tableJsonFileList.length; i++) {
    var filePath = path.join(data.localAccessDirectory, tableJsonFileList[i]);
    joinJson.addAttrToJsonObj(table, filePath, tableKeyList[i]);
    //if (tableJsonFileList[i] === (prefixItem + '_SNP.head_table.xls.json')) {
    //    var SNPHeadTable = joinJson.getJsonObj(filePath);
    //    table['SNP.head_table.xls'] = SNPHeadTable;
    //} else if (tableJsonFileList[i] === (prefixItem + '_InDel.head_table.xls.json')) {
    //    var InDelHeadTable = joinJson.getJsonObj(filePath);
    //    table['InDel.head_table.xls'] = InDelHeadTable;
    //} else {
    //    joinJson.buildJsonObj(table,filePath);
    //}
}


data.table = table;
//console.log('finish json', data);
fs.writeFileSync('./reportTempl.json', JSON.stringify(data));

setHandlebars();

//var data = joinJson.getJsonObj("./data.json");
var result = template(data);
fs.writeFileSync('detailReport.html', result);


function getSequenceFilePrefix(mSequenceFile, data) {
    var sequenceFile = mSequenceFile;
    var sequencePrefixFile = [];
    var fileSuffix = null;
    if (sequenceFile.length) {
        var otherFileReg = /\.(vcf)|\.(bam)/g;
        var i;
        var currentFileName;
        var lastMatchedStr;
        var filePrefix;
        if (otherFileReg.test(sequenceFile[0])) {
            for (i = 0; i < sequenceFile.length; i++) {
                currentFileName = sequenceFile[i];
                otherFileReg.lastIndex = 0;
                if (otherFileReg.test(currentFileName)) {
                    lastMatchedStr = currentFileName.match(otherFileReg)[currentFileName.match(otherFileReg).length - 1];
                    filePrefix = currentFileName.substring(currentFileName.lastIndexOf('/') + 1, currentFileName.lastIndexOf(lastMatchedStr));
                    if (!checkIsRepeat(sequencePrefixFile, filePrefix)) {
                        sequencePrefixFile.push(filePrefix);
                    }
                    if (fileSuffix == null) {
                        fileSuffix = currentFileName.substring(currentFileName.lastIndexOf('.'), currentFileName.length);
                    }
                }
            }
        } else {
            for (i = 0; i < sequenceFile.length; i++) {
                var doubleEndReg = /[\._]R?[12]/g;
                currentFileName = sequenceFile[i];
                if (doubleEndReg.test(currentFileName)) {
                    lastMatchedStr = currentFileName.match(doubleEndReg)[currentFileName.match(doubleEndReg).length - 1];
                    filePrefix = currentFileName.substring(currentFileName.lastIndexOf('/') + 1, currentFileName.lastIndexOf(lastMatchedStr));
                    if (!checkIsRepeat(sequencePrefixFile, filePrefix)) {
                        sequencePrefixFile.push(filePrefix);
                    }
                    if (fileSuffix == null) {
                        var prefix = "";
                        prefix = currentFileName.substring(0, currentFileName.lastIndexOf(lastMatchedStr)) + lastMatchedStr;
                        fileSuffix = currentFileName.substring(prefix.length, currentFileName.length);
                    }
                }
            }
        }
        data.fileSuffix = fileSuffix;
    }
    return sequencePrefixFile;
}

function checkIsRepeat(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == item) {
            return true;
        }
    }
    return false;
}

function setHandlebars() {
    handlebars.registerHelper("getAttrValue", function (obj, attr, options) {
        return obj[attr];
    });

    handlebars.registerHelper("getImagePosition", function (rootData, item, options) {
        var sequenceFile = rootData.sequenceFile;
        for (var i = 0; i < sequenceFile.length; i++) {
            if (sequenceFile[i] === item) {
                return i;
            }
        }
        return 0;
    });

    handlebars.registerHelper("getImageUrl", function (rootData, filePrefix, options) {
        var url = rootData.serverUrl + '/public/' + rootData.taskName + '/' + rootData.taskId + '/output/fig_table/' + filePrefix;
        return url;
    });

    handlebars.registerHelper("imageGroup", function (rootData, options) {

        var sequenceFile = rootData.sequenceFile;
        //console.log('sequenceFile',sequenceFile);
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
        //console.log("keylist",obj);
        var keyList = [];
        for (var keyItem in obj) {
            keyList.push(keyItem);
        }
        //console.log("key:", keyList);
        return options.fn(keyList);
    });

    handlebars.registerHelper("getObjValueList", function (obj, options) {
        var valueList = [];
        for (var keyItem in obj) {
            valueList.push(obj[keyItem]);
        }
        //console.log("key:", keyList);
        return options.fn(valueList);
    });

    handlebars.registerHelper("getFirstFromArray", function (obj, options) {
        return options.fn(obj[0]);
    });
}