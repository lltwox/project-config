exports = module.exports = StorageSet;

var _ = require('lodash'),
    parseArgs = require('minimist'),
    Storage = require('./storage');

/**
 * Main storage of config objects
 *
 */
function StorageSet() {
    this.storages = {'defaults': new Storage({}, 'defaults')};
    this.storagesOrder = ['defaults'];

    this.pendingLinks = [];
}

/**
 * Add values from process argv
 *
 * @param {String} prefix
 * @param {String} delimiter
 */
StorageSet.prototype.addArgv = function(prefix, delimiter) {
    var store = new Storage({}, 'argv', delimiter);
    var argv = parseArgs(process.argv.slice(2));
    delete argv._;
    Object.keys(argv).forEach(function(key) {
        var value;
        try {
            value = JSON.parse(argv[key]);
        } catch (err) {
            value = argv[key];
        }

        store.set(key, value);
    });

    if (prefix) store = new Storage(store.get(prefix), 'argv');
    if (delimiter) store.setDelimiter(Storage.DEFAULT_DELIMITER);
    var name = this.getDefaultName('argv');
    this.remove(name);
    this.storages[name] = store;
    this.storagesOrder.push(name);
};

/**
 * Add value from environment
 *
 * @param {String} prefix
 * @param {String} delimiter
 */
StorageSet.prototype.addEnv = function(prefix, delimiter) {
    var store = new Storage({}, 'env', delimiter);
    Object.keys(process.env).forEach(function(key) {
        var value;
        try {
            value = JSON.parse(process.env[key]);
        } catch (err) {
            value = process.env[key];
        }

        store.set(key, value);
    });

    if (prefix) store = new Storage(store.get(prefix), 'env');
    if (delimiter) store.setDelimiter(Storage.DEFAULT_DELIMITER);
    var name = this.getDefaultName('env');
    this.remove(name);
    this.storages[name] = store;
    this.storagesOrder.push(name);
};

/**
 * Prepend values - new store added with low priority
 *
 * @param {Object} data
 * @param {String} [name]
 */
StorageSet.prototype.prepend = function(data, name) {
    name = name || this.getDefaultName('prepend');
    this.remove(name);
    if (data) {
        this.storages[name] = new Storage(data, 'prepend');
        this.storagesOrder.splice(1, 0, name);
    }
};

/**
 * Append values - new store added with high priority
 *
 * @param {Object} data
 * @param {String} [name]
 */
StorageSet.prototype.append = function(data, name) {
    name = name || this.getDefaultName('append');
    this.remove(name);
    if (data) {
        this.storages[name] = new Storage(data, 'append');
        this.storagesOrder.push(name);
    }
};

/**
 * Set object for default store - lowest priority store
 *
 * @param {Object} data
 */
StorageSet.prototype.defaults = function(data) {
    this.storages.defaults = new Storage(data, 'defaults');
};

/**
 * Remove store by name
 *
 * @param {String} name
 */
StorageSet.prototype.remove = function(name) {
    if (name == 'defaults') return this.defaults({});

    var index = this.storagesOrder.indexOf(name);
    if (index < 0) return;

    this.storagesOrder.splice(index, 1);
    delete this.storages[name];
};

/**
 * Get value for path or whole object
 *
 * @param {String} [path]
 */
StorageSet.prototype.get = function(path) {
    var objects = [];
    this.storagesOrder.forEach(function(name) {
        var data = this.storages[name].get(path);
        if (data !== null && data !== undefined) objects.push(data);
    }.bind(this));
    var merged = this.merge(objects);

    return this.parseLinks(merged);
};

/**
 * Set value for path
 *
 * @param {String} path
 * @param {Object|String} value
 */
StorageSet.prototype.set = function(path, value) {
    var lastStore = this.storages[this.storagesOrder[this.storagesOrder.length - 1]];
    if (lastStore.getType() != 'set') {
        var name = this.getDefaultName('set');
        this.remove(name);
        lastStore = new Storage({}, 'set');
        this.storages[name] = lastStore;
        this.storagesOrder.push(name);
    }

    lastStore.set(path, value);
};

/**
 * @param {String} type
 * @return {String}
 * @private
 */
StorageSet.prototype.getDefaultName = function(type) {
    return '__' + type + '_' + Object.keys(this.storages).length;
};

/**
 * @param {Array} objects
 * @return {Object}
 */
StorageSet.prototype.merge = function(objects) {
    var merged;
    objects.forEach(function(object) {
        if (typeof merged != 'object' || typeof object != 'object') {
            merged = object;
        } else {
            merged = _.merge(merged, object);
        }
    });

    return merged;
};

/**
 * @param {Object} object
 * @return {Object}
 * @private
 */
StorageSet.prototype.parseLinks = function(object) {
    if (!object) return object;

    if (typeof object == 'string' && object.indexOf('@') === 0) {
        var link = object.substr(1);
        if (link.indexOf('@') == 0) { // @ is escaped
            return link;
        }

        if (this.pendingLinks.indexOf(link) >= 0) {
            throw new Error('Circular link detected: ' + link);
        }

        this.pendingLinks.push(link);
        var replaced = this.get(link);
        this.pendingLinks.splice(this.pendingLinks.indexOf(link), 1);

        return replaced;
    }

    if (typeof object == 'object') {
        Object.keys(object).forEach(function(key) {
            object[key] = this.parseLinks(object[key]);
        }.bind(this));
    }

    return object;
};