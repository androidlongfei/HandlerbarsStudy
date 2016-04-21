/**
 * Created by longfei on 16/3/7.
 *
 * make json file conver json obj
 *
 */

var fs = require("fs");

var TAG = 'joinJsonFile';

/**
 * get json obj by json file path
 * @param filePath
 */
function getJsonObj(filePath) {
    fs.exists(filePath, function (exists) {
        if (!exists) {
            console.log(TAG, filePath + '不存在');
            return null;
        }
    });
    var data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data;
}

/**
 * add attr to jsonObj,specified oneself key,value is file content
 * @param jsonObj
 * @param filePath
 * @returns {*} jsonObj
 */
function addAttrToJsonObj(jsonObj, filePath, key) {
    var data = getJsonObj(filePath);
    if (data) {
        jsonObj[key] = data;
    }
    return jsonObj;
}

/**
 * build json obj,with file name as obj key,file content as value
 * @param jsonObj
 * @param filePath
 * @returns {*} jsonObj
 */
function buildJsonObj(jsonObj, filePath) {
    var data = getJsonObj(filePath);
    if (data) {
        var key = filePath.substr(filePath.lastIndexOf('/') + 1);
        jsonObj[key] = data;
    }
    return jsonObj;
}

/**
 * create json obj,with file name as obj key,file content as value
 * @param jsonObj
 * @param filePath
 * @returns {*} jsonObj
 */
function createJsonObj(filePath) {
    var jsonObj = {};
    var data = getJsonObj(filePath);
    if (data) {
        var key = filePath.substr(filePath.lastIndexOf('/') + 1);
        jsonObj[key] = data;
    }
    return jsonObj;
}

exports.getJsonObj = getJsonObj;
exports.addAttrToJsonObj = addAttrToJsonObj;
exports.buildJsonObj = buildJsonObj;
exports.createJsonObj = createJsonObj;


