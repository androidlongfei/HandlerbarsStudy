var exec = require('child_process').exec;
var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var joinJson = require('../lib/joinJson/joinJsonFileObj.js');
var config = require("../config.js");
var async = require('async');

var relateDir = "";
//var relateDir = "./detailReport/cardio";//以service.js为基准，获取当前相对目录
//var relateDir = "./cardio";//以test.js为基准，获取当前相对目录

var executeDir = process.cwd();
var moudleDir = path.join(config.rootDirectory, "code", "detailReport", "cardio");
relateDir = "./" + path.relative(executeDir, moudleDir);

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

    handlebars.registerHelper("showViewBySuffix", function (obj, options) {
        if (obj.fileSuffix == '.bam') {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
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

    handlebars.registerHelper("getImageUrl", function (rootData, filePrefix, fileSuffix, options) {
        var taskUrl = "";
        //taskUrl = rootData.serverUrl + '/public/' + rootData.taskName + '/' + rootData.taskId + '/output/fig_table/' + filePrefix + fileSuffix;
        //return taskUrl;
        taskUrl = "src/img/down/" + filePrefix + fileSuffix;
        try {
            var originUrl = rootData.resourcesDirectory + "/" + filePrefix + fileSuffix;
            if (!fs.existsSync(originUrl)) {
                taskUrl = "src/img/report-default.jpg";
            }
        } catch (except) {
            console.log(except)
        }
        return taskUrl;
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

function generateDetaileReportTemp(taskName, taskId) {
    var source = fs.readFileSync(path.join(relateDir, "detailReportTemp.html"), "utf8");
    var template = handlebars.compile(source);

    var data = {};
    data.workspaceDirectory = config.workspaceDirectory;
    data.serverUrl = "http://192.168.5.14:3030";
    data.taskName = taskName;
    data.taskId = taskId;
    //data.resourcesDirectory = path.join(data.workspaceDirectory, data.taskName, data.taskId, "output", "fig_table");
    //data.cpTargetDirectory = data.resourcesDirectory;
    data.resourcesDirectory = path.join(relateDir, "testData");
    data.cpTargetDirectory = path.join("/Users/longfei/Desktop", "htmlTempl");
    if (!fs.existsSync(data.cpTargetDirectory)) {
        fs.mkdirSync(data.cpTargetDirectory);
    }

    //测序文件前缀集合,主要用来获取图片
    //var inputFileJson = joinJson.getJsonObj(path.join(data.workspaceDirectory, data.taskName, data.taskId, 'input.json'));
    var inputFileJson = joinJson.getJsonObj(path.join(data.resourcesDirectory, 'input.json'));
    var sequenceFile = {};
    if (inputFileJson) {
        sequenceFile = inputFileJson.inputFiles.sequenceFile;
        sequenceFile = getSequenceFilePrefix(sequenceFile, data);
        data.sequenceFile = sequenceFile;
    }

    //表格json文件
    var table = {};
    var prefixItem = data.sequenceFile[0];
    var tableJsonFileList = ['summary_QC.xls.json', 'summary.information.xls.json', 'summary_SNP_variant_statistics.xls.json',
        'summary_SNP_exonic_statistics.xls.json', 'summary_tstv.xls.json', 'summary_SNP_statistics.xls.json',
        (prefixItem + '_SNP.head_table.xls.json'), 'summary_InDel_variant_statistics.xls.json',
        'summary_InDel_exonic_statistics.xls.json', 'summary_InDel_statistics.xls.json',
        (prefixItem + '_InDel.head_table.xls.json')];
    var tableKeyList = ['summaryQC', 'summaryInfo', 'summarySNPVariantStat', 'summarySNPExonicStat', 'summaryTstv', 'summarySNPStat',
        'SNPHeadTable', 'summaryInDelVariantStat', 'summaryInDelExonicStat', 'summaryInDelStat', 'InDelHeadTable'];
    for (var i = 0; i < tableJsonFileList.length; i++) {
        var filePath = path.join(data.resourcesDirectory, tableJsonFileList[i]);
        joinJson.addAttrToJsonObj(table, filePath, tableKeyList[i]);
    }
    data.table = table;
    fs.writeFileSync(path.join(relateDir, 'reportTemp.json'), JSON.stringify(data));

    //生成模板
    setHandlebars();
    var result = template(data);
    fs.writeFileSync(path.join(relateDir, 'detailReport.html'), result);

    //拷贝图片
    var originPath = data.resourcesDirectory;
    var targetPath = path.join(data.cpTargetDirectory, "src", "img", "down");

    var photoAbsolutePathArr = getPhotoAbsolutePathArr(data.sequenceFile, originPath);
    //console.log("photo array", photoAbsolutePathArr);
    var allPhotoPathStr = "";
    for (var i = 0; i < photoAbsolutePathArr.length; i++) {
        var itemPhotoPath = photoAbsolutePathArr[i];
        allPhotoPathStr += itemPhotoPath;
        if (i != (photoAbsolutePathArr.length - 1)) {
            allPhotoPathStr += " ";
        }
    }

    //拷贝模板到指定路径下
    var cpFolderCommand = "cp -r" + " " + path.join(relateDir, "src") + " " + data.cpTargetDirectory;
    //exec(cpFolderCommand);

    var cpHtmlTempCommand = "cp" + " " + path.join(relateDir, "detailReport.html") + " " + data.cpTargetDirectory;

    var cpJsonTempCommand = "cp" + " " + path.join(relateDir, "reportTemp.json") + " " + data.cpTargetDirectory;

    var cpPhotoCommand = "cp" + " " + allPhotoPathStr + " " + targetPath;
    //console.log("cpPhotoCommand",cpPhotoCommand);

    async.series([
            async.apply(exec, cpFolderCommand),
            async.apply(exec, cpHtmlTempCommand),
            async.apply(exec, cpJsonTempCommand),
            async.apply(exec, cpPhotoCommand)
        ],
        function (err, result) {
            //console.log(result);
        }
    );
    //exec(cpHtmlTempCommand);
}

/**
 * generate photo absolute path array by sequenceFile array
 * @param sequenceFiles
 * @param originPath
 * @returns {Array}
 */
function getPhotoAbsolutePathArr(sequenceFiles, originPath) {
    var photoAbsolutePathArr = [];
    var photoNameSuffixArr = ['.error_rate.png', '.quality_score.png', '.histPlot.png',
        '.cumuPlot.png', '_histogram.png', '.capture_depth.png',
        '.capture_coverage.png', '_SNP_variant_statistics.png', '_SNP_exonic_statistics.png',
        '_tstv.png', '_SNP_statistics.png', '_InDel_variant_statistics.png', '_InDel_exonic_statistics.png',
        '_InDel_statistics.png'];
    for (var i = 0; i < sequenceFiles.length; i++) {
        var photoFilePrefix = sequenceFiles[i];
        for (var j = 0; j < photoNameSuffixArr.length; j++) {
            var photoFileSuffix = photoNameSuffixArr[j];
            var photoAbsolutePath = originPath + "/" + photoFilePrefix + photoFileSuffix;
            photoAbsolutePathArr.push(photoAbsolutePath);
        }
    }
    return photoAbsolutePathArr;
}

/**
 * delete all file and dir expert root dir by dirPath
 * @param dirPath
 */
function rmDir(dirPath) {
    var files = fs.readdirSync(dirPath);
    if (files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            var filePath = path.join(dirPath, files[i]);
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            } else {
                rmDir(filePath);
            }
        }
    }
    //fs.rmdirSync(dirPath);
};

generateDetaileReportTemp('cardio', '8af02470-88da-11e5-bc12-5193afdc4a0c');