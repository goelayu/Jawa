"use strict";
/*!
 * Copyright (c) 2017-2019 Cliqz GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerBlocker = exports.BlockingContext = exports.fromPuppeteerDetails = void 0;
const tldts_experimental_1 = require("tldts-experimental");
const adblocker_1 = require("@cliqz/adblocker");
const adblocker_content_1 = require("@cliqz/adblocker-content");
function sleep(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
function getTopLevelUrl(frame) {
    let sourceUrl = '';
    while (frame !== null) {
        sourceUrl = frame.url();
        if (sourceUrl.length !== 0) {
            break;
        }
        frame = frame.parentFrame();
    }
    return sourceUrl.replace(/https?:\/\/web.archive.org\/web\/\d+\//, '');
}
/**
 * Create an instance of `Request` from `puppeteer.Request`.
 */
function fromPuppeteerDetails(details) {
    const sourceUrl = getTopLevelUrl(details.frame());
    const url = details.url().replace(/https?:\/\/web.archive.org\/web\/\d+\//, '');
    const type = details.resourceType();
    return adblocker_1.Request.fromRawDetails({
        _originalRequestDetails: details,
        requestId: `${type}-${url}-${sourceUrl}`,
        sourceUrl,
        type,
        url,
    });
}
exports.fromPuppeteerDetails = fromPuppeteerDetails;
/**
 * Wrap `FiltersEngine` into a Puppeteer-friendly helper class.
 */
class BlockingContext {
    constructor(page, blocker) {
        this.page = page;
        this.blocker = blocker;
        this.onFrameNavigated = (frame) => blocker.onFrameNavigated(frame);
        this.onRequest = (request) => blocker.onRequest(request);
    }
    async enable() {
        if (this.blocker.config.loadCosmeticFilters === true) {
            // Register callback to cosmetics injection (CSS + scriptlets)
            this.page.on('frameattached', this.onFrameNavigated);
            this.page.on('domcontentloaded', () => {
                this.onFrameNavigated(this.page.mainFrame());
            });
        }
        if (this.blocker.config.loadNetworkFilters === true) {
            // Make sure request interception is enabled for `page` before proceeding
            await this.page.setRequestInterception(true);
            // NOTES:
            //  - page.setBypassCSP(enabled) might be needed to perform
            //  injections on some pages.
            //  - we currently do not perform CSP headers injection as there is
            //  currently no way to modify responses in puppeteer. This feature could
            //  easily be added if puppeteer implements the required capability.
            //
            // Register callback for network requests filtering.
            this.page.on('request', this.onRequest);
        }
    }
    async disable() {
        if (this.blocker.config.loadNetworkFilters === true) {
            this.page.removeListener('request', this.onRequest);
            await this.page.setRequestInterception(false);
        }
        if (this.blocker.config.loadCosmeticFilters === true) {
            this.page.removeListener('frameattached', this.onFrameNavigated);
        }
    }
}
exports.BlockingContext = BlockingContext;
/**
 * Wrap `FiltersEngine` into a Puppeteer-friendly helper class. It exposes
 * methods to interface with Puppeteer APIs needed to block ads.
 */
class PuppeteerBlocker extends adblocker_1.FiltersEngine {
    constructor() {
        super(...arguments);
        this.contexts = new WeakMap();
        // ----------------------------------------------------------------------- //
        // PuppeteerBlocker-specific additions to FiltersEngine
        // ----------------------------------------------------------------------- //
        this.onFrameNavigated = async (frame) => {
            try {
                await this.onFrame(frame);
            }
            catch (ex) {
                // Ignore
            }
        };
        this.onFrame = async (frame) => {
            const url = frame.url();
            if (url === 'chrome-error://chromewebdata/') {
                return;
            }
            // Look for all iframes in this context and check if they should be removed
            // from the DOM completely. For this we check if their `src` or `href`
            // attribute would be blocked by any network filter.
            this.removeBlockedFrames(frame).catch(() => {
                /* ignore */
            });
            const parsed = tldts_experimental_1.parse(url);
            const hostname = parsed.hostname || '';
            const domain = parsed.domain || '';
            // We first query for stylesheets and scriptlets which are either generic or
            // based on the hostname of this frame. We need to get these as fast as
            // possible to reduce blinking when page loads.
            {
                const { active, styles, scripts } = this.getCosmeticsFilters({
                    domain,
                    hostname,
                    url,
                    // Done once per frame.
                    getBaseRules: true,
                    getInjectionRules: true,
                    getRulesFromHostname: true,
                    // Will handle DOM features (see below).
                    getRulesFromDOM: false,
                });
                if (active === false) {
                    return;
                }
                Promise.all([
                    this.injectScriptletsIntoFrame(frame, scripts),
                    this.injectStylesIntoFrame(frame, styles),
                ]).catch(() => {
                    /* ignore */
                });
            }
            // Seconde step is to start monitoring the DOM of the page in order to
            // inject more specific selectors based on `id`, `class`, or `href` found on
            // nodes. We first query all of them, then monitor the DOM for a few
            // seconds (or until one of the stopping conditions is met, see below).
            const observer = new adblocker_content_1.DOMMonitor(({ ids, hrefs, classes }) => {
                const { active, styles } = this.getCosmeticsFilters({
                    domain,
                    hostname,
                    url,
                    // DOM information
                    classes,
                    hrefs,
                    ids,
                    // Only done once per frame (see above).
                    getBaseRules: false,
                    getInjectionRules: false,
                    getRulesFromHostname: false,
                    // Allows to get styles for updated DOM.
                    getRulesFromDOM: true,
                });
                // Abort if cosmetics are disabled
                if (active === false) {
                    return;
                }
                this.injectStylesIntoFrame(frame, styles).catch(() => {
                    /* ignore */
                });
            });
            // This loop will periodically check if any new custom styles should be
            // injected in the page (using values of attributes `id`, `class`, or `href`).
            //
            // We stop looking in the following cases:
            // * Frame was detached.
            // * No new attribute was found.
            // * Number of iterations exceeded 10 (i.e. 5 seconds).
            // * Exception was raised.
            //
            // Additionally, we might stop after the first lookup if
            // `enableMutationObserver` is disabled in config, which means that we
            // should not actively monitor the DOM for changes.
            let numberOfIterations = 0;
            do {
                if (frame.isDetached()) {
                    break;
                }
                try {
                    const foundNewFeatures = observer.handleNewFeatures(await frame.$$eval('[id],[class],[href]', adblocker_content_1.extractFeaturesFromDOM));
                    numberOfIterations += 1;
                    if (numberOfIterations === 10) {
                        break;
                    }
                    if (foundNewFeatures === false) {
                        break;
                    }
                }
                catch (ex) {
                    break;
                }
                if (this.config.enableMutationObserver === false) {
                    break;
                }
                await sleep(500);
            } while (true);
        };
        this.onRequest = (details) => {
            const request = fromPuppeteerDetails(details);
            var oldurl = request.url;
	    //request.url = request.url.replace(/https?:\/\/web.archive.org\/web\/\d+\//, '');
	    //request.sourceUrl = request.sourceUrl.replace(/https?:\/\/web.archive.org\/web\/\d+\//, '');
            if (this.config.guessRequestTypeFromUrl === true && request.type === 'other') {
                request.guessTypeOfRequest();
            }
            const frame = details.frame();
            if (request.isMainFrame() ||
                (request.type === 'document' && frame !== null && frame.parentFrame() === null)) {
                details.continue();
                return;
            }
            const { redirect, match } = this.match(request);
            if (redirect !== undefined) {
                if (redirect.contentType.endsWith(';base64')) {
                    details.respond({
                        body: Buffer.from(redirect.body, 'base64'),
                        contentType: redirect.contentType.slice(0, -7),
                    });
                }
                else {
                    details.respond({
                        body: redirect.body,
                        contentType: redirect.contentType,
                    });
                }
            }
            else if (match === true && request.url.indexOf('https://archive.org/includes/analytics.js')<0) {
                details.abort('blockedbyclient');
            }
            else {
                details.continue();
            }
        };
    }
    // ----------------------------------------------------------------------- //
    // Helpers to enable and disable blocking for 'browser'
    // ----------------------------------------------------------------------- //
    async enableBlockingInPage(page) {
        let context = this.contexts.get(page);
        if (context !== undefined) {
            return context;
        }
        context = new BlockingContext(page, this);
        this.contexts.set(page, context);
        await context.enable();
        return context;
    }
    async disableBlockingInPage(page) {
        const context = this.contexts.get(page);
        if (context === undefined) {
            throw new Error('Trying to disable blocking which was not enabled');
        }
        this.contexts.delete(page);
        await context.disable();
    }
    isBlockingEnabled(page) {
        return this.contexts.has(page);
    }
    async injectStylesIntoFrame(frame, styles) {
        if (styles.length !== 0) {
            await frame.addStyleTag({
                content: styles,
            });
        }
    }
    async injectScriptletsIntoFrame(frame, scripts) {
        const promises = [];
        if (scripts.length !== 0) {
            for (let i = 0; i < scripts.length; i += 1) {
                promises.push(frame.addScriptTag({
                    content: adblocker_content_1.autoRemoveScript(scripts[i]),
                }));
            }
        }
        await Promise.all(promises);
    }
    /**
     * Look for sub-frames in `frame`, check if their `src` or `href` would be
     * blocked, and then proceed to removing them from the DOM completely.
     */
    async removeBlockedFrames(frame) {
        const promises = [];
        const sourceUrl = getTopLevelUrl(frame);
        for (const url of await frame.$$eval('iframe[src],iframe[href]', (elements) => elements.map(({ src, href }) => src || href))) {
            const { match } = this.match(adblocker_1.Request.fromRawDetails({
                url,
                sourceUrl,
                type: 'sub_frame',
            }));
            if (match) {
                promises.push(frame
                    .$$eval(`iframe[src="${url}"],iframe[href="${url}"]`, (iframes) => {
                    var _a;
                    for (const iframe of iframes) {
                        (_a = iframe === null || iframe === void 0 ? void 0 : iframe.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(iframe);
                    }
                })
                    .catch(() => {
                    /* ignore */
                }));
            }
        }
        await Promise.all(promises);
    }
}
exports.PuppeteerBlocker = PuppeteerBlocker;
// Re-export symboles from @cliqz/adblocker for convenience
__exportStar(require("@cliqz/adblocker"), exports);
//# sourceMappingURL=adblocker.js.map
