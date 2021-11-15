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
        var bcd = anotherglobal;
        function b(){
            global = bcd + 2;
            bcd = 4;
            function d(){

            }
        }
        function c(){
            function e(){
                
            }
        }
        return b;
    }
    var ret = a();
    ret();
    `;
    var testFile = "test.js";
    fs.writeFileSync(testFile, src);
    var cmd = `node ${INSTRUMENTOR} -i ${testFile} -n "testurl;;;;${testFile}" -t js -r state`;
    var res = spawnSync(cmd, {shell:true});
    console.log(res.stdout.toString(), res.stderr.toString())
    console.log(`Input length: ${src.length}`)
}

testFuncLen();