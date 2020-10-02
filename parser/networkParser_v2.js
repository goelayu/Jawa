// This module is same as networkParser 


class netEvents {
    constructor(events, plt){
        this.events = events;
        this.entries = new Map();
        this.firstRequestId;
        this.domContentLoaded = plt.loadTime/2
        this.onLoad = plt.loadTime;
    }

    processEvents(){
        this.events.forEach((e)=>{
            var method = Object.keys(e)[0];
            var params = Object.values(e)[0];
            var handler = netEvents.prototype[`_${method.replace('.', '_')}`];
            if (handler)
                handler.call(this, params);
        })
    }


    _Network_requestWillBeSent(params) {
        const {requestId, initiator, timestamp, redirectResponse} = params;
        // skip data URI
        if (params.request.url.match('^data:')) {
            return;
        }
        // the first is the first request
        if (!this.firstRequestId && initiator.type === 'other') {
            this.firstRequestMs = timestamp * 1000;
            this.firstRequestId = requestId;
        }
        // redirect responses are delivered along the next request
        if (redirectResponse) {
            const redirectEntry = this.entries.get(requestId);
            // craft a synthetic response params
            redirectEntry.responseParams = {
                response: redirectResponse
            };
            // set the redirect response finished when the redirect
            // request *will be sent* (this may be an approximation)
            redirectEntry.responseFinishedS = timestamp;
            redirectEntry.encodedResponseLength = redirectResponse.encodedDataLength;
            // since Chrome uses the same request id for all the
            // redirect requests, it is necessary to disambiguate
            const newId = requestId + '_redirect_' + timestamp;
            // rename the previous metadata entry
            this.entries.set(newId, redirectEntry);
            // this.entries.delete(requestId);
        }
        // initialize this entry
        this.entries.set(requestId, {
            requestParams: params,
            responseParams: undefined,
            responseLength: 0, // built incrementally
            encodedResponseLength: undefined,
            responseFinishedS: undefined,
            responseBody: undefined,
            responseBodyIsBase64: undefined,
            newPriority: undefined
        });
    }

    _Network_dataReceived(params) {
        const {requestId, dataLength} = params;
        const entry = this.entries.get(requestId);
        if (!entry) {
            return;
        }
        entry.responseLength += dataLength;
    }

    _Network_responseReceived(params) {
        const entry = this.entries.get(params.requestId);
        if (!entry) {
            return;
        }
        entry.responseParams = params;
    }

    _Network_resourceChangedPriority(params) {
        const {requestId, newPriority} = params;
        const entry = this.entries.get(requestId);
        if (!entry) {
            return;
        }
        entry.newPriority = newPriority;
    }

    _Network_loadingFinished( params) {
        const {requestId, timestamp, encodedDataLength} = params;
        const entry = this.entries.get(requestId);
        if (!entry) {
            return;
        }
        entry.encodedResponseLength = encodedDataLength;
        entry.responseFinishedS = timestamp;
    }

}

module.exports = {
    netEvents:netEvents
}