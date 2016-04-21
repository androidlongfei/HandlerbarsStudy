
var cardioRetailReport = require("./cardio/cardioDetailReportModule");


var reportConfig = {
    "cardio":cardioRetailReport
}

/**
 * generate detailReport templete by taskName and taskId
 * @param taskName
 * @param taskId
 */
function generateDetaileReportTemp (taskName, taskId) {
    var reportModle = reportConfig[taskName];
    if(reportModle){
        reportModle.generateDetaileReportTemp(taskName,taskId);
    }else{
        console.log(taskName+"应用没有详细报告");
    }
}

exports.generateDetaileReportTemp = generateDetaileReportTemp;