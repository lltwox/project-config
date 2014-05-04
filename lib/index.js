exports = module.exports = Config;

var fs = require('fs'),
    jsonminify = require('jsonminify'),
    nconf = require('nconf');

/**
 * Base dir for all configs to be loaded from.
 * Defaults to null, which means that config files will be looked
 * up relative to current working directory.
 *
 * Can be redefined with --config-base-dir argv param or CONFIG_BASE_DIR
 * environment variable
 *
 * @type {String}
 */
var baseDir = null;

/**
 * Environment prefix to be added to all config filenames.
 * Defaults to null, which means all filenames will be left as is.
 *
 * Can be redefined with --config-env argv param or CONFIG_ENV
 * or NODE_ENV environment vars
 *
 * @type {String}
 */
var env = null;

/*
 * Configuration management class. Allows to load several files into one
 * literal object, add default values and add values from process.argv and
 * process.env.
 *
 * @param {String} path - path to config or explicit config file
 * @constructor
 */
function Config(data) {

    /**
     * Counter used to generate new filenames
     *
     * @type {Number}
     */
    this.added = 0;

    /**
     * Internal config storage
     *
     * @type {nconf}
     */
    this.nconf = new nconf.Provider();

    if (data) {
        this.add(data, 'main');
    }
}

/**
 * Set base directory for all config locations
 *
 * @param {String} dir
 */
Config.setBaseDir = function(dir) {
    baseDir = dir.replace(/(\/)+$/, '');
};

/**
 * Clear base directory
 *
 */
Config.unsetBaseDir = function() {
    baseDir = null;
};

/**
 * Set environment for configs, it will be added as suffix to filename
 *
 * @param {String} env
 */
Config.setEnv = function(newEnv) {
    env = newEnv;
};

/**
 * Reset environment
 *
 */
Config.unsetEnv = function() {
    env = null;
};

/**
 * Init config variables, dependent on evironment
 *
 */
Config.init = function() {
    process.argv.forEach(function(arg) {
        var parts = arg.split('=');
        if (parts.length < 2) return;

        if (parts[0] == '--config-base-dir') {
            baseDir = parts[1];
        }
        if (parts[0] == '--config-env') {
            env = parts[1];
        }
    });

    Object.keys(process.env).forEach(function(key) {
        if (key == 'CONFIG_BASE_DIR') {
            baseDir = process.env[key];
        }
        if (key == 'CONFIG_ENV' || key == 'NODE_ENV') {
            env = process.env[key];
        }
    });
};

/**
 * Load to config file values from command line arguments
 *
 * @return {Config}
 */
Config.prototype.addArgv = function() {
    this.nconf.argv();
    return this;
};

/**
 * Load to config file values from environment
 *
 * @return {Config}
 */
Config.prototype.addEnv = function() {
    this.nconf.env();
    return this;
};

/**
 * Add values both from command line arguments and environment
 *
 * @return {Config}
 */
Config.prototype.addSystem = function() {
    return this.addArgv().addEnv();
};

/**
 * Add file or object to config.
 * All new values do not replace existing ones
 *
 * @param {String|Object} data
 * @param {String} name - optional name to store it under, so object or
 *                 file can be removed later
 * @return {Config}
 */
Config.prototype.add = function(data, name) {
    name = name || this.getDefaultName();
    this.nconf.add(name, {type: 'literal', store: this.loadData(data)});
    return this;
};

/**
 * Add file or object to config.
 * All added values DO replace existing ones
 *
 * @param {String|Object} data
 * @param {String} name - optional name to store it under, so object or
 *                 file can be removed later
 * @return {Config}
 */
Config.prototype.use = function(data, name) {
    var stores = this.nconf.stores,
        keys = Object.keys(stores),
        index = null;

    this.nconf.stores = {};
    name = name || this.getDefaultName();
    this.nconf.add(name, {type: 'literal', store: this.loadData(data)});
    for (index in keys) {
        if (keys[index] == name) {
            continue;
        }
        this.nconf.stores[keys[index]] = stores[keys[index]];
    }

    return this;
};

/**
 * Remove data from config file, that was added before with given name
 *
 * @param {String} name
 * @return {Config}
 */
Config.prototype.remove = function(name) {
    this.nconf.remove(name);
    return this;
};

/**
 * Get result configuration literal object
 *
 * @param {String} part
 * @return {Object}
 */
Config.prototype.get = function(part) {
    return this.nconf.get(part);
};

/**
 * Create a new config object based on current one
 *
 * @return {Config}
 */
Config.prototype.copy = function() {
    return new Config(this.get(), false);
};

/**
 * Convert given data to literal config
 *
 * @param  {String|Object} data
 * @return {Object}
 * @private
 */
Config.prototype.loadData = function(data) {
    var object = null;
    if (typeof data == 'string') {
        object = this.loadJson(data);
    } else if (typeof data == 'object') {
        object = this.clone(data);
    } else if (!data) {
        object = {};
    } else {
        throw new Error(
            'Invalid parameter: path or literal object expected'
        );
    }

    return object;
};

/**
 * Load json file
 *
 * @param  {string} path
 * @return {Object}
 * @private
 */
Config.prototype.loadJson = function(path) {
    if (path.indexOf('.json') >= 0) {
        path = path.substr(0, path.indexOf('.json'));
    }

    if (baseDir) {
        path = baseDir + '/' + path;
    }
    if (env) {
        path += '.' + env;
    }
    path += '.json';

    if (!fs.existsSync(path)) {
        throw new Error('File not found: ' + path);
    }
    if (!fs.statSync(path).isFile()) {
        return new Error('Invalid file: ' + path);
    }

    var file = fs.readFileSync(path, 'utf8');
    var json = {};
    try {
        json = JSON.parse(jsonminify(file));
    } catch (err) {
        throw new Error('Invalid json file ' + path + ': ' + err.message);
    }

    return json;
};

/**
 * @return {String}
 * @private
 */
Config.prototype.getDefaultName = function() {
    return 'data-' + (++this.added);
};

/**
 * Deep copy literal object
 *
 * @param  {Object} literal
 * @return {Object}
 * @private
 */
Config.prototype.clone = function(literal) {
    return JSON.parse(JSON.stringify(literal));
};
