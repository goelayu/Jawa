// This modules converts a DOM string into node dom object

var fs = require('fs'),
    htmParser = require('node-html-parser'),
    program = require('commander');

program
    .option('-d, --dom [dom]', 'path to the dom file')
    .parse(process.argv);

var parse = function(f){
    return fs.readFileSync(f, 'utf-8');
}

var getAllNodes = function(dom){
    var nodeCount=0;
    var traverseNodes = function(childNodes){
        if (!childNodes) return;
        nodeCount+=childNodes.length;
        for (var n of childNodes){
            traverseNodes(n.childNodes);
        }
    };
    traverseNodes(dom.childNodes);
    return nodeCount;
}

var getDOM = function(domFile){
    var domStr = parse(domFile);
    var dom = htmParser.parse(domStr);
    console.log(`${getAllNodes(dom)}`);
}

function main(){
    getDOM(program.dom);
}

main();