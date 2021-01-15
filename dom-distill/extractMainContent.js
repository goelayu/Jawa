function createXPathFromElement(elm) { 
    var allNodes = document.getElementsByTagName('*'); 
    var xPathsList = [];
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
    { 
        if (elm.hasAttribute('id')) { 
                var uniqueIdCount = 0; 
                for (var n=0;n < allNodes.length;n++) { 
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                    if (uniqueIdCount > 1) break; 
                }; 
                // if ( uniqueIdCount == 1) { 
                //     segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                //     xPathsList.push(segs.join('/'));
                //     return xPathsList;
                // } else { 
                //     segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
                // } 
                segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
        } else if (elm.hasAttribute('class')) { 
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
        } else { 
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.localName == elm.localName)  i++; }; 
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
        }; 
        xPathsList.push('/' + segs.join('/') );
    }; 
    return xPathsList;
};

function getParentXpaths(elem){
    var xPathPrefixes = createXPathFromElement(elem),
        parentXPaths = [];

    var len = xPathPrefixes.length;
    if (!len) return parentXPaths;
    var mainElem = xPathPrefixes[len-1];
    parentXPaths.push(mainElem)

    xPathPrefixes.forEach((prfx)=>{
        parentXPaths.push(mainElem.replace(prfx,''));
    })
    
    parentXPaths.pop();
    return parentXPaths;
}

function _elemsFromPaths(elemArr){
    return elemArr.map(e=>$x(e));
}

function deleteBoilerPlate(mainPaths){
    var len = mainPaths.length,
        top = mainPaths[len - 1],
        mainContent = mainPaths[0];
    
    var mainElems = _elemsFromPaths(mainPaths)
    var traverseAndDeleteDOM = function(node){
        if (!node.childElementCount) return;
        node.childNodes.forEach((n)=>{
            if (mainElems.indexOf(n)<0)
                n.remove();
            else traverseAndDeleteDOM(n);
        });
    }
}
