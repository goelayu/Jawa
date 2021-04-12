var fs = require('fs');

dyn = JSON.parse(fs.readFileSync(process.argv[2],'utf-8'))

var t = Object.values(dyn).reduce((acc,cur)=>{return acc+cur},0)
console.log(t)