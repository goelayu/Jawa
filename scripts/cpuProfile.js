/*
* This module takes in input the cpu profile and runs
* analytical operations on it
* Note that it takes in the raw JS Profile
Usage: node cpuProfile.js <path to the js profile>
*/
var program = require('commander');
var fs = require('fs');
var util = require('util')
const { spawnSync } = require('child_process');
var {cpuProfileParser} = require("../devtool-cpu-model/analyze_cpu_profile.js");

program
    .version("0.1.0")
    .option("-i, --input [input]","path to the input raw js Profile")
    .option("-p, --plt [plt]","page load time to cutoff profiler time")
    .option('-o, --output [output]', 'path to the output file')
    .option('-s, --specific [specific]', "name of the function whose time needs to be inquired")
    .option('-t, --type [type]')
    .parse(process.argv)


var cpuRawInput = JSON.parse(fs.readFileSync(program.input, "utf-8"));
var plt; 
if (program.plt){
    var _plt = JSON.parse(fs.readFileSync(program.plt,"utf-8"));
    plt=_plt.end - _plt.startTime;
}
var cpu = cpuProfileParser(cpuRawInput,plt);
if (program.plt)
    fs.writeFileSync(program.input+".trim", JSON.stringify(cpuRawInput));
var cpuTimeWoProgram = cpu.raw.total - ((cpu.raw.idleNode ? cpu.raw.idleNode.self : 0) + (cpu.raw.programNode ? cpu.raw.programNode.self : 0 ));
var cpuTime = cpu.raw.total - ((cpu.raw.idleNode ? cpu.raw.idleNode.self : 0));


var sumTotalTime = function(rti) {
    var cpuTime = 0, cpuTime = 0;
    var ignoreRTI = ["idle", "garbage collector"];
    // if (!overall)
    //     ignoreRTI.push("program");
    rti.forEach((child)=>{
        cpuTime += getTimeFromId(child);
    })
    return cpuTime;
}

function getUniqueIds(idArr){
    var uniqueIds = [], seenUIDs = [];
    idArr.forEach((id)=>{
        var node = cpu.raw._idToNode.get(id);
        if (seenUIDs.indexOf(JSON.stringify(node.callFrame))<0) {
            seenUIDs.push(JSON.stringify(node.callFrame));
            uniqueIds.push(id);
        }
    });
    return uniqueIds;
}
function recurseSubtree(allNodes, rootNode){
    var nodesInSubtree = [];

    function updateSubTree(child){
        nodesInSubtree.push(child);
    }

    function recurse(root){
        if (root.children.length) {
            root.children.forEach((child)=>{
                var childNodeIndex = allNodes.map((rtiNode)=>{return rtiNode.callUID}).indexOf(child)
                var childNode = allNodes[childNodeIndex];
                recurse(childNode);
                updateSubTree(childNode);
            });
        }
    }

    recurse(rootNode);
    return nodesInSubtree;
}


var getSubTree = function(rootNode){
    var listOfIds = [];

    function update(id){
        listOfIds.push(id);
    }

    function recurseChildren(root){
        root.children.forEach((child)=>{
            if (listOfIds.indexOf(child.id)>=0) return;
            update(child.id);
            recurseChildren(child);
        });
    }

    recurseChildren(rootNode);
    return listOfIds;
}

var getSubTreeSimple = function(rootNode){
    var listOfIds = [];

    function update(id){
        listOfIds.push(id);
    }

    function recurseChildren(root){
        console.log("list length: ",listOfIds.length," with root ", root.profileNode.UID)
        root.profileNode.children.forEach((child)=>{
            if (listOfIds.indexOf(child.UID)>=0) return;
            update(child.UID);
            recurseChildren(child);
        });
    }

    recurseChildren(rootNode);
    return listOfIds;
}

var getCorrespondingInvocationFromId = function(id){
    var nnodes = cpu.raw._idToNode.size;
    var matchedNodes =[];
    for (var i=1;i<=nnodes;i++){
        var node = cpu.raw._idToNode.get(i);
        if (node.callUID == cpu.raw._idToNode.get(id).callUID)
            matchedNodes.push(cpu.raw._idToNode.get(i));
    }
    return matchedNodes;
}
var getTimeFromId = function( id){
    var BUind = cpu.parsed.children.map((r)=>{return r.profileNode.id}).indexOf(id);
    if (BUind>=0) {
        return cpu.parsed.children[BUind].self;
    }
    else { 
        var ttime = 0;
        const reducer = (accumulator, currentValue) => accumulator + currentValue.self;
        var matchingNodes = getCorrespondingInvocationFromId(id);
        ttime = matchingNodes.length ? matchingNodes.reduce(reducer,0) + cpu.raw._idToNode.get(id).self 
        : cpu.raw._idToNode.get(id).self ;
        return ttime;
    }
}

var getTimeFromIdSimple = function(id){
    var node = null, len = cpu.parsed.children.length;
    for(var i=0;i<len;i++){
        var _t = cpu.parsed.children[i];
        if (_t.profileNode.UID == id){
            node = _t;
            break;
        }
    }
    if (!node){
        console.error("No node found with UID", id);
        return 0;
    }
    return node.self;
}

var checkForExistenceOfId = function(idArr, dstArr){
    var idArrUIDs = idArr.map((id)=>{
        return JSON.stringify(cpu.raw._idToNode.get(id).callFrame);
    })
    var dstArrUIDs = dstArr.map((id)=>{
        return [JSON.stringify(cpu.raw._idToNode.get(id).callFrame),id];
    })
    return dstArrUIDs.filter((i)=>{return idArrUIDs.indexOf(i[0])<0}).map((i)=>{return i[1]});
}

var finalIDSanityCheck = function(idArr){
    var seenUIDs = [];
    idArr.forEach((id)=>{
        var node = cpu.raw._idToNode.get(id);
        if (seenUIDs.indexOf(node.callUID)>=0)
            console.error("Ids with same location found");
        seenUIDs.push(node.callUID);
    })
}

function topKRtiSimple(rti, k){
    var a =sumTotalTime
    var rti = rti.children;
    var inbuiltRoots = []; 
    var listOfIds = [];
    var _sortedRTI = rti.filter((f)=>{return f.profileNode.depth!=0});
    var sortedRTI = _sortedRTI.sort((a,b)=>{return b.self - a.self});
    var threshhold = k*cpuTimeWoProgram/100, curTime = 0;
    for (var rtiIter = 0; rtiIter < sortedRTI.length && curTime <= threshhold; rtiIter++){
        var curFn = sortedRTI[rtiIter];
        //If the same id has been added (via the children of one of the previous nodes)
        // if (listOfIds.indexOf(curFn.profileNode.UID)>=0) continue;
        // If a different invocation has been already via the children of the previous nodes
        // if (listOfIds.map((id)=>{
        //     return JSON.stringify(cpu.raw._idToNode.get(id).callFrame);
        // }).indexOf(JSON.stringify(curFn.profileNode.callFrame))>=0)
        //     continue;
        //Test whether the root is inbuilt or not. 
        if (!curFn.profileNode.callFrame.url.startsWith("http")) {
            inbuiltRoots.push(curFn);
            continue;
        }
        listOfIds.push(curFn.profileNode.UID);
        // console.log(curFn.profileNode.callUID)
        // var subTree = getSubTreeSimple(curFn);
        // subTree = checkForExistenceOfId(listOfIds, getUniqueIds(subTree));
        // listOfIds = listOfIds.concat(subTree);
        var subtreeTimeBU = 0; 
        // if (subTree.length) subTree.forEach((st)=>{
        //     subtreeTimeBU+= getTimeFromIdSimple(st);
        // })
        // console.log("ASSERT : " +  (subtreeTime + curFn.self) == curFn.total);
        curTime += subtreeTimeBU + curFn.self
    }
    // console.log(inbuiltRoots.length, listOfIds.length);
    return listOfIds;
}
/*
Returns list of node indexes accounting for
k% of total runtime
*/
function topKRti(rti, k){
    var a =sumTotalTime
    var rti = rti.children;
    var inbuiltRoots = []; 
    var listOfIds = [];
    var _sortedRTI = rti.filter((f)=>{return f.profileNode.depth!=0});
    var sortedRTI = _sortedRTI.sort((a,b)=>{return b.self - a.self});
    var threshhold = k*cpuTimeWoProgram/100, curTime = 0;
    for (var rtiIter = 0; rtiIter < sortedRTI.length && curTime <= threshhold; rtiIter++){
        var curFn = sortedRTI[rtiIter];
        //If the same id has been added (via the children of one of the previous nodes)
        if (listOfIds.indexOf(curFn.profileNode.UID)>=0) continue;
        
        listOfIds.push(curFn.profileNode.UID);
        var subTree = getSubTree(curFn.profileNode);
        subTree = checkForExistenceOfId(listOfIds, getUniqueIds(subTree));
        listOfIds = listOfIds.concat(subTree);
        var subtreeTimeRaw = 0, subtreeTimeBU = 0; 
        // subTree.forEach((st)=>{subtreeTimeRaw+= cpu.raw._idToNode.get(st).self})
        if (subTree.length) subTree.forEach((st)=>{
            subtreeTimeBU+= getTimeFromId(st);
        })
        // console.log("ASSERT : " +  (subtreeTime + curFn.self) == curFn.total);
        curTime += subtreeTimeBU + curFn.self
    }
    // console.log(inbuiltRoots.length, listOfIds.length);
    return listOfIds;
}

//returns unique ids only those which have a url defined
var getUniqueFunctions = function(ids){
    var callGraph = cpu.raw;
    var functionIds = [], seenCallFrame = [];
    var nnodes = callGraph._idToNode.size;
    for (var i=0;i<ids.length;i++){
        var node = callGraph._idToNode.get(ids[i]);
        if (seenCallFrame.indexOf(JSON.stringify(node.callFrame))<0 && node.callFrame.url.startsWith("http")){
            seenCallFrame.push(JSON.stringify(node.callFrame));
            functionIds.push(node.callFrame);
        }
    }
    return functionIds;
}

var getIdCategories = function(idArr) {
    var idToCat = {root: 0, child: 0};
    idArr.forEach((id)=>{
        var BUind = cpu.parsed.children.map((r)=>{return r.profileNode.id}).indexOf(id);
        if (BUind>=0) {
            idToCat.root++
        }
        else { 
            idToCat.child++
        }
    });
    return idToCat;
}

var computeCategories = function(cpu){
    var categories = ["urlWithHttp", "urlNoHttp", "nourl"]
    var result = {};

    cpu.forEach((node)=>{
        if (node.url.startsWith("http")){
            if (!result[categories[0]]) 
                result[categories[0]] = []
            result[categories[0]].push(node)
        } else if (node.url != "") {
            if (!result[categories[1]]) 
                result[categories[1]] = []
            result[categories[1]].push(node)
        } else {
            if (!result[categories[3]]) 
                result[categories[3]] = []
            result[categories[3]].push(node)
        }
    })
    return result;
}
var getIdFromCallGraph = function(){
    var ids = [];
    var nnodes = cpu.raw._idToNode.size;
    for (var i=1;i<=nnodes;i++){
        var node = cpu.raw._idToNode.get(i);
        ids.push(node.id);
    }
    return ids;
}

var getLeafNodes = function(ids){
    var leafNodes = [];
    ids.forEach((id)=>{
        var profileNode = cpu.raw._idToNode.get(id);
        var subTree = getSubTree(profileNode);
        if (!subTree.length) {
            leafNodes.push(id);
            return;
        }
        for (var childId of subTree){
            var childNode = cpu.raw._idToNode.get(childId);
            if (childNode.url.startsWith("http"))
                return;
        }
        leafNodes.push(id);
    })

    return leafNodes;
}

var getLeafNodesUsingTime = function(){
    var leafNodes = [];
    var totalNodes = cpu.parsed.children;
    var ibf = ["(program)","(idle)","(garbage collector)"]
    totalNodes.forEach((node)=>{
        if ( (node.self) && ibf.indexOf(node.functionName)<0 && 
                // && node.children.length == 0 && 
                node.profileNode.callFrame.url.startsWith("http")){
            /*Candidate for potential leaf node*/
            if (node.children.length > 0)
                console.log("Leaf node but has children");
            leafNodes.push(node);
        }
    })
    return leafNodes;
}

var instrumentationSrcs = ["tracer.js","omni.min"];
var excludeFnNames = ["stringify","analyze","compare","cacheAnd","traverse","replay_arg"]
var instrumentationOverhead = function(){
    var instNodes = [];
    var totalNodes = cpu.parsed.children;
    totalNodes.forEach((node)=>{
        var url = node.profileNode.callFrame.url,
            fn = node.profileNode.callFrame.functionName;
        if (instrumentationSrcs.find(e=>url.indexOf(e)>=0) && 
            excludeFnNames.find(e=>fn.indexOf(e)>=0)==null) {
            // console.log(node.profileNode.callFrame, node.self)
            instNodes.push(node);
        }
    })
    return instNodes;
}

var getUserDefinedTime = function(cpu){
    var time = 0;
    var topUDFns = []
    cpu.parsed.children.sort((a,b)=>{return b.self - a.self}).forEach((child)=>{
        if (child.profileNode.url.startsWith("http")
            && child.profileNode.url.indexOf('_static')<0){
            // console.log(child.profileNode.callFrame.url, child.self);
            time += child.self
        } else {
            var b = 4;
            // console.log(child.profileNode.callFrame)
        }
    })
    return time;
}

function main(){
    // var totalTime = sumTotalTime(cpu, true);
    // var top20RTI = topKFnFromRTI(cpu, 20);
    // var timeoftop20= sumTotalTime(top20RTI, false);
    // var categorizedCPU = computeCategories(cpu);
    // var timeOnlyUrl = sumTotalTime(categorizedCPU["urlWithHttp"], false);
    // var top20RTIOnlyUrl = topKFnFromRTI(categorizedCPU["urlWithHttp"], 20);
    // var time80OnlyUrl = topKRti(cpu,80);
    // var timeoftop20OnlyUrl = sumTotalTime(top20RTIOnlyUrl, false);
    // var timeof80rtiOnlyUrl = sumTotalTime(time80OnlyUrl);

    
    var top80percentRTI = topKRti(cpu.parsed, 80);
    // finalIDSanityCheck(top80percentRTI);
    var leafNodes = getLeafNodes(top80percentRTI);
    var timeInstrumented = 0;
    var top80percentRTIUser = top80percentRTI.map((id)=>{
        var child = cpu.raw._idToNode.get(id);
        if (child.url.startsWith("http")) {
            timeInstrumented += getTimeFromId(id);
            return {self:getTimeFromId(id), total: child.total, callUID: child.callUID, functionName: child.functionName,
                url: child.url, raw: child.callFrame, id:id};
        }
    }).filter(node => node);
    var leafNodesTime = 0;
    var leafNodesUser = leafNodes.map((id)=>{
        var child = cpu.raw._idToNode.get(id);
        if (child.url.startsWith("http")) {
            leafNodesTime += getTimeFromId(id);
            return {self:getTimeFromId(id), total: child.total, callUID: child.callUID, functionName: child.functionName,
                url: child.url, raw: child.callFrame, id:id};
        }
    }).filter(node => node);

    // var totalUniqueFunctions = getUniqueFunctions(getIdFromCallGraph());
    // var totalUniqueFunctionsInst = getUniqueFunctions(top80percentRTI);
    // var totalUniqueFunctionsInstUser = getUniqueFunctions(top80percentRTIUser.map((node)=>{return node.id}))


    // console.log(totalUniqueFunctions.length, totalUniqueFunctionsInst.length, totalUniqueFunctionsInstUser.length)
    // console.log(sumTotalTime(top80percentRTI)*100/cpuTimeWoProgram, sumTotalTime(top80percentRTIUser.map((node)=>{return node.id}) )*100/cpuTimeWoProgram,
    //   totalUniqueFunctionsInst.length*100/totalUniqueFunctions.length, totalUniqueFunctionsInstUser.length*100/totalUniqueFunctions.length);
    // process.stdout.write(util.format(cpuTimeWoProgram, cpuTime));
    //print the BU time vs the total cpu time
    // const reducer = (accumulator, currentValue) => accumulator + currentValue.self;
    // console.log(cpu.parsed.children.reduce(reducer), cpuTime)
    var allIdes = cpuRawInput.nodes.map(n=>n.id);
    fs.writeFileSync(program.output, JSON.stringify(leafNodesUser));
    // process.stdout.write(util.format(getUniqueFunctions(allIdes).length))
    // console.log("Written " + top80percentRTIUser.length + " functions: " +  program.input);
    process.stdout.write(util.format(cpuTime + " " + cpuTimeWoProgram));
}

var specificFnTime = function(fnName){
    var time = 0, declTime = 0;
    for (child of cpu.parsed.children){
        if (child.profileNode.callFrame.functionName.toLowerCase().indexOf(fnName)>=0){
        declTime =  child.total;
            break;
        }
        // if (child.profileNode.url.indexOf("goelayu")>=0){
        //     time += child.profileNode.total;
            // console.log(child.profileNode.callFrame, child.profileNode.total);
        // }
    }
    return declTime;

}
// var leafNodes = getLeafNodesUsingTime();
// // var topExpensiveNodes = topKRtiSimple(cpu.parsed, 80)
// // console.log(topExpensiveNodes.length, cpu.parsed.children.length)
// var leafTime = 0;
// var leafNodesUser = leafNodes.map((child)=>{
//         if (child.url.startsWith("http")) {
//             leafTime += child.self;
//             return {self:child.self, total: child.total, callUID: child.callUID, functionName: child.functionName,
//                 url: child.url, raw: child.profileNode.callFrame};
//         }
//     }).filter(node => node);

// var instNodes = instrumentationOverhead();
// console.log(leafTime);
program.output && fs.writeFileSync(program.output, JSON.stringify(leafNodesUser))
if (program.type == "u") process.stdout.write(util.format(getUserDefinedTime(cpu) + " "));
if (program.type == "p") process.stdout.write(util.format(cpu.raw.programNode.self));
if (program.type == "a") process.stdout.write(util.format(cpuTimeWoProgram + " " + cpuTime));
if (program.type == "t") process.stdout.write(util.format(cpuTimeWoProgram));
var ret;
// console.log(cpu.raw.total, cpu.parsed.children.reduce((acc, cur)=>{return acc + cur.self},0))
program.specific && (ret = specificFnTime(program.specific));
program.specific && process.stdout.write(util.format(" " + ret));



