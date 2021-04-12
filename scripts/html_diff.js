var HtmlDiffer = require('html-differ').HtmlDiffer;
var fs = require('fs');
var htmlDiffer = new HtmlDiffer({
    'ignoreAttributes':['style'],
    ignoreDuplicateAttributes:true
});

var html1 = fs.readFileSync(process.argv[2], 'utf-8'),
    html2 = fs.readFileSync(process.argv[3], 'utf-8');

    var diff = htmlDiffer.diffHtml(html1, html2);
    console.log(diff);