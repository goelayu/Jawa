(function dynamicAPIIntercepts(){
    window.__dynAPI__ = {};
    window.__getDynAPI = function(){
        return window.__dynAPI__;
    }

    var mobileAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1";

    function interceptAPI(api, prop){
        var propDesc = Object.getOwnPropertyDescriptor(api, prop);
        var oldget, oldset;
        if (propDesc && propDesc.get)
            oldget = propDesc.get;
        if (propDesc && propDesc.set)
            oldset = propDesc.set;

        Object.defineProperty(api, prop,{
            get: function(){
                window.__dynAPI__[prop]++;

                if (prop == 'userAgent'){
                    if (Math.random() < 0.5)
                        return oldget.call(this);
                    else return mobileAgent;
                } else if (prop == 'innerWidth' || prop == 'innerHeight'){
                    if (Math.random() < 0.5)
                        return oldget.call(this);
                    else return 375;
                }
                
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