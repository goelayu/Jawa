/**
 * 
 * Tests the instrument.js framework
 */

const { spawnSync } = require('child_process'),
    fs = require('fs')

const INSTRUMENTOR = '/vault-home/goelayu/webArchive/program_analysis/instrument.js';

function testFuncLen(){
    var src=`
    function a(){
        var bcd;
        function b(){
            function d(){

            }
        }
        function c(){
            function e(){
                
            }
        }
    }
    `;
    var testFile = "7878";
    fs.writeFileSync(testFile, src);
    var cmd = `node ${INSTRUMENTOR} -i ${testFile} -n testing -t js -r dynamic-cfg`;
    spawnSync(cmd, {shell:true});
}

testFuncLen();