/*!
 * puppeteer-extra-plugin-adblocker v2.11.10 by remusao
 * https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-adblocker
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var os = _interopDefault(require('os'));
var path = _interopDefault(require('path'));
var adblockerPuppeteer = require('@cliqz/adblocker-puppeteer');
var fetch = _interopDefault(require('node-fetch'));
var puppeteerExtraPlugin = require('puppeteer-extra-plugin');

const pkg = require('../package.json');
const engineCacheFilename = `${pkg.name}-${pkg.version}-engine.bin`;
/**
 * A puppeteer-extra plugin to automatically block ads and trackers.
 */
class PuppeteerExtraPluginAdblocker extends puppeteerExtraPlugin.PuppeteerExtraPlugin {
    constructor(opts) {
        super(opts);
        this.debug('Initialized', this.opts);
    }
    get name() {
        return 'adblocker';
    }
    get defaults() {
        return {
            blockTrackers: false,
            useCache: true,
            cacheDir: undefined
        };
    }
    get engineCacheFile() {
        const cacheDir = this.opts.cacheDir || os.tmpdir();
        return path.join(cacheDir, engineCacheFilename);
    }
    /**
     * Cache an instance of `PuppeteerBlocker` to disk if 'cacheDir' option was
     * specified for the plugin. It can then be used the next time this plugin is
     * used to load the adblocker faster.
     */
    async persistToCache(blocker) {
        if (!this.opts.useCache) {
            return;
        }
        this.debug('persist to cache', this.engineCacheFile);
        await fs.promises.writeFile(this.engineCacheFile, blocker.serialize());
    }
    /**
     * Initialize instance of `PuppeteerBlocker` from cache if possible.
     * Otherwise, it throws and we will try to initialize it from remote instead.
     */
    async loadFromCache() {
        if (!this.opts.useCache) {
            throw new Error('caching disabled');
        }
        this.debug('load from cache', this.engineCacheFile);
        return adblockerPuppeteer.PuppeteerBlocker.deserialize(new Uint8Array(await fs.promises.readFile(this.engineCacheFile)));
    }
    /**
     * Initialize instance of `PuppeteerBlocker` from remote (either by fetching
     * a serialized version of the engine when available, or by downloading raw
     * lists for filters such as EasyList then parsing them to initialize
     * blocker).
     */
    async loadFromRemote() {
        this.debug('load from remote', { blockTrackers: this.opts.blockTrackers });
	console.log('returning custom filter');
	return adblockerPuppeteer.PuppeteerBlocker.parse(fs.readFileSync('/home/goelayu/research/webArchive/filter-lists/combined-alexa-3k.txt', 'utf-8'));
        if (this.opts.blockTrackers === true) {
            return adblockerPuppeteer.PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch);
        }
        else {
            return adblockerPuppeteer.PuppeteerBlocker.fromPrebuiltAdsOnly(fetch);
        }
    }
    /**
     * Return instance of `PuppeteerBlocker`. It will take care of initializing
     * it if necessary (first time it is called), or return the existing instance
     * if it already exists.
     */
    async getBlocker() {
        this.debug('getBlocker', { hasBlocker: !!this.blocker });
        if (this.blocker === undefined) {
            try {
                this.blocker = await this.loadFromCache();
            }
            catch (ex) {
                this.blocker = await this.loadFromRemote();
                await this.persistToCache(this.blocker);
            }
        }
        return this.blocker;
    }
    /**
     * Hook into this blocking event to make sure the cache is initialized before navigation.
     */
    async beforeLaunch() {
        this.debug('beforeLaunch');
        await this.getBlocker();
    }
    /**
     * Hook into this blocking event to make sure the cache is initialized before navigation.
     */
    async beforeConnect() {
        this.debug('beforeConnect');
        await this.getBlocker();
    }
    /**
     * Enable adblocking in `page`.
     */
    async onPageCreated(page) {
        this.debug('onPageCreated');
        (await this.getBlocker()).enableBlockingInPage(page);
    }
}
var index = (options = {}) => {
    return new PuppeteerExtraPluginAdblocker(options);
};

exports.PuppeteerExtraPluginAdblocker = PuppeteerExtraPluginAdblocker;
exports.default = index;


  module.exports = exports.default || {}
  Object.entries(exports).forEach(([key, value]) => { module.exports[key] = value })
//# sourceMappingURL=index.cjs.js.map
