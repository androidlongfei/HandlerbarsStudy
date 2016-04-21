/**
 * Created by longfei on 16/3/8.
 */

var async = require('async');
var exec = require('child_process').exec;
//var detailReportModule = require('./detailReportExportModule');
//detailReportModule.generateDetaileReportTemp('cardio','8af02470-88da-11e5-bc12-5193afdc4a0c');

exec("node ./cardio/testLocalCardioReport.js");

//testSeries();

function testSeries(){
    async.series([
            function () {
                detailReportModule.generateDetaileReportTemp('cardio','8af02470-88da-11e5-bc12-5193afdc4a0c');
            }],
        function (err, result) {
            console.log(result);
        }
    );
}