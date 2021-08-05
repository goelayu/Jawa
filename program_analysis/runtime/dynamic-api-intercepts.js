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
                window.__dynAPI__[prop]++;
                
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
        'Navigator-3' : "language",
        'Navigator-4' : "appVersion",
        'Navigator-5' : "language",
        'Navigator-6' : "plugins",
        'Navigator-7' : "platform",
        'Navigator-8' : "cookieEnabled",
        'Navigator-9' : "maxTouchPoints",
        'Navigator-10' : "vendor",
        'Navigator-11' : "hardwareConcurrency",
        'Navigator-12' : "deviceMemory",
        'Navigator-13' : "mimeTypes",
        'Navigator-14' : "languages",
        'Navigator-15' : "doNotTrack",
        'Navigator-16' : "productSub",
        'Navigator-17' : "vendorSub",
        'Navigator-18' : "xr",
        'Window-1':'innerWidth',
        'Window-2':'innerHeight',
        'Window-3':'screen',
        'Window-4':'pageXOffset',
        'Window-5':'pageYOffset',
        'Window-6':'devicePixelRatio',
        'Window-7':'outerWidth',
        'Window-8':'outerHeight',
        'Window-9' : 'screenLeft',
        'Window-10' : 'screenRight',
        'Window-11' : 'screenTop',
        'Window-12' : 'screenBottom'

    }

    Object.entries(APIs).forEach((entry)=>{
        var [api,prop] = entry;
        api = api.split('-')[0];
        if (api == 'Window')
            interceptAPI(window,prop);
        else interceptAPI(window[api].prototype,prop);
        window.__dynAPI__[prop]=0;
    })
})();