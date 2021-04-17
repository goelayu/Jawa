/**
 * This script generates a static call graph using'
 * the approximate call graph library
 * It patches that call graph with missing flow information
 */

var fs = require('fs'),
    cgPatcher = require('../../utils/patch-cfg'),
    {spawnSync} = require('child_process'),
    zlib = require('zlib');


const STATICANALYSER = `${__dirname}/../javascript-call-graph/main.js`;

var contentFiles = [];

var extractFileNames = function(dynamicCfg){
    /**
     * Parses the dynamic cfg and creates a filename array
     */
    var filenames = [];
    dynamicCfg.forEach((id)=>{
        var idArr = id.split('-');
        var _filename =  idArr.slice(0,idArr.length - 4).join('-');
        if (filenames.indexOf(_filename)<0 && _filename != '')
            filenames.push(_filename);
    })
    return filenames;
}

var extractContent = function(zipped){
    try {
        return zlib.gunzipSync(zipped).toString()
    }catch (e) {
        return "";
    }
}

var execACGModule = function(filenames, srcDir){
    var baseCMD = `node --max-old-space-size=64512 ${STATICANALYSER} `;
    var cmdArgs = ' ';
    var tmpDir = `${srcDir}/__metadata__/static_temp`;
    !fs.existsSync(tmpDir) && fs.mkdirSync(tmpDir);
    // var filenames = fs.readdirSync(program.jsSrc)
    filenames.forEach((file)=>{
        var fileDir = `${srcDir}/${file}`;
        var fileInfo = JSON.parse(fs.readFileSync(`${fileDir}/${file}`));
        var fileContent;
        if (fileInfo.zip){
            var _buffer = fs.readFileSync(`${fileDir}/content`);
            fileContent = extractContent(_buffer);
            var tmpFile = `${tmpDir}/${file}`
            fs.writeFileSync(tmpFile, fileContent);
            cmdArgs += ` ${tmpFile}`;
            contentFiles.push(tmpFile);
        } else 
            cmdArgs += ` ${fileDir}/content`;
            contentFiles.push(`${fileDir}/content`);
        // cmdArgs += ` ${srcDir}/${file}/${file}`;
    });
    console.log(`Executing static analysis command with args: ${cmdArgs}`)
    var cfgCMD = baseCMD + `--cg --fg ${cmdArgs} 2> ${srcDir}/__metadata__/cg 1>${srcDir}/__metadata__/fg`;
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

var patchCFG = function(srcDir){
    var cg = `${srcDir}/__metadata__/cg`,
        fg = `${srcDir}/__metadata__/fg`;
    
    var completeCg = cgPatcher.findMissingCallees(cg, fg);
    return completeCg;
}

/**
 * 
 * @param {string} srcDir //path to the directory containing all JS files 
 * @param {Array} dynamicGraph // array containing all dynamic function nodes
 */
var getCallGraph = function(srcDir, dynamicGraph, runModule, time){
    var filenames = extractFileNames(dynamicGraph);
    if (time)
        var staticStart = process.hrtime();
    if (runModule) execACGModule(filenames, srcDir);
    if (time)
        var staticEnd = process.hrtime(staticStart);
    // var allIds = getAllIds(srcDir);
    var completeGraph = patchCFG(srcDir)
    
    var graph = new Graph(completeGraph);
    // graph.buildGraph();
    if (time)
        time.static = staticEnd;
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
    getCallGraph : getCallGraph,
    contentFiles: contentFiles
}