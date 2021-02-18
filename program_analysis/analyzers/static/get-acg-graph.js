/**
 * This script generates a static call graph using'
 * the approximate call graph library
 * It patches that call graph with missing flow information
 */

var fs = require('fs'),
    cgPatcher = require('../../utils/patch-cfg'),
    {spawnSync} = require('child_process')


const STATICANALYSER = `${__dirname}/../javascript-call-graph/main.js`

var extractFileNames = function(dynamicCfg){
    /**
     * Parses the dynamic cfg and creates a filename array
     */
    var filenames = [];
    dynamicCfg.forEach((id)=>{
        var _filename =  id.split('-').slice(0,id.split('-').length - 4).join('-');
        if (filenames.indexOf(_filename)<0 && _filename != '')
            filenames.push(_filename);
    })
    return filenames;
}

var execACGModule = function(filenames, srcDir){
    var baseCMD = `node --max-old-space-size=64512 ${STATICANALYSER} `;
    var cmdArgs = ' ';
    // var filenames = fs.readdirSync(program.jsSrc)
    filenames.forEach((file)=>{
        if (file == '' || file.indexOf('-script-')>=0) return;
        cmdArgs += ` ${srcDir}/${file}/${file}`;
    });
    var cfgCMD = baseCMD + `--cg --fg${cmdArgs} 2> ${srcDir}/cg 1>${srcDir}/fg`;
    //create cfg
    // program.verbose && console.log(`creating cfg: ${cfgCMD}`)
    var _cmdOut = spawnSync(cfgCMD, {shell:true} );
    
    // program.verbose && console.log(_cmdOut.stderr.toString())
}

var getAllIds = function(srcDir){
    var filenames = fs.readdirSync(srcDir);
    var allIds = {};
    filenames.forEach((file)=>{
        try {    
            var idFile = `${srcDir}/${file}/ids`;
            var ids = JSON.parse(fs.readFileSync(idFile, 'utf-8'));
            allIds[file] = ids;
        } catch (e) {
            // program.verbose && console.log(`Error while readings ids for ${file}`);
        }
    });
    return allIds;
}

var patchCFG = function(allIds, srcDir){
    var cg = `${srcDir}/cg`,
        fg = `${srcDir}/fg`;
    
    var completeCg = cgPatcher.findMissingCallees(cg, fg, allIds);
    return completeCg;
}

/**
 * 
 * @param {string} srcDir //path to the directory containing all JS files 
 * @param {Array} dynamicGraph // array containing all dynamic function nodes
 */
var getCallGraph = function(srcDir, dynamicGraph){
    var filenames = extractFileNames(dynamicGraph);
    // execACGModule(filenames, srcDir);
    var allIds = getAllIds(srcDir);
    var completeGraph = patchCFG(allIds, srcDir)
    
    var graph = new Graph(completeGraph);
    // graph.buildGraph();
    return graph;
}

class Graph{
    constructor (data){
        this.raw = data;
        this.nodes = new Set;
        this.callers = new Set;
        this.callerCallee = {};
    }

    buildGraph(){
        this.raw.forEach((entry)=>{
            var [caller, callee] = entry;
            if (!(caller in this.callerCallee)){
                this.callerCallee[caller] = new Set;
                this.callers.add(caller);
                this.nodes.add(caller);
            }
            this.nodes.add(callee);
            this.callerCallee[caller].add(callee);
        });
    }
}

module.exports = {
    getCallGraph : getCallGraph
}