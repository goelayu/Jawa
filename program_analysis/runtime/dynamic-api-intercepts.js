(function dynamicAPIIntercepts(){
    window.__dynAPI__ = {};
    window.__getDynAPI = function(){
        return window.__dynAPI__;
    }

    function interceptAPI(api, prop){
        var propDesc = Object.getOwnPropertyDescriptor(api, prop);
        var oldget, oldset;
        if (propDesc && propDesc.get)
            oldget = propDesc.get;
        if (propDesc && propDesc.set)
            oldset = propDesc.set;
        else{
            if (prop == 'cookie')
                oldget =  document.cookie;
            if (prop == 'lastModified')
                oldget =  document.lastModified
            if (prop == 'referrer')
                oldget =  document.referrer;
        }

        Object.defineProperty(api, prop,{
            get: function(){
                window.__dynAPI__[prop].push(__tracer.peakCallStack());
                
                if (oldget && oldget.call)
                    return oldget.call(this);
                else 
                    return oldget
            },
            set: function(h){
                if (oldset && oldset.call)
                    return oldset.call(this,h);
                else 
                    return oldset = h;
            }
        })
    }

    const APIs = {
        'Navigator-1' : "userAgent",
        'Navigator-2' : "platform",
        'HTMLDocument-1' : "cookie",
        'HTMLDocument-2' : "lastModified",
        'HTMLDocument-3' : "referrer"
    }

    Object.entries(APIs).forEach((entry)=>{
        var [api,prop] = entry;
        api = api.split('-')[0];
        interceptAPI(window[api].prototype,prop);
        window.__dynAPI__[prop]=[];
    })
})();