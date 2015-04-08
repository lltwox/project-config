exports = module.exports = Config;

var StorageSet = require('./storage-set'),
    Loader = require('./loader');

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
 * Operates with 'storages' - parts of config files, that merged
 * for final result. Each storage has priority. Values from storages with
 * higher priorities overwrite same values from storages with lower priorities.
 *
 * @param {String|Object} data - path to config or explicit config file
 * @constructor
 */
function Config(data) {

    /**
     * Storage for all configs
     *
     * @type {StorageSet}
     */
    this.storageSet = new StorageSet();

    /**
     * Class, that loads new values
     *
     * @type {Loader}
     */
    this.loader = new Loader(baseDir, env);

    if (data) this.prepend(data, 'main');
}

/**
 * Set base directory for all config locations
 *
 * @param {String} dir
 * @return {Config}
 */
Config.setBaseDir = function(dir) {
    baseDir = dir.replace(/(\/)+$/, '');
    return Config;
};

/**
 * Clear base directory
 *
 * @return {Config}
 */
Config.unsetBaseDir = function() {
    baseDir = null;
    return Config;
};

/**
 * Get current value of base directory
 *
 * @return {String}
 */
Config.getBaseDir = function() {
    return baseDir;
};

/**
 * Set environment for configs, it will be added as suffix to filename
 *
 * @param {String} newEnv
 * @return {Config}
 */
Config.setEnv = function(newEnv) {
    env = newEnv;
    return Config;
};

/**
 * Reset environment
 *
 * @return {Config}
 */
Config.unsetEnv = function() {
    env = null;
    return Config;
};

/**
 * Get current env value
 *
 * @return {String}
 */
Config.getEnv = function() {
    return env;
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
 * Values are added with `append` method, which means, that it will replace
 * any existing values.
 *
 * @param {String} prefix
 * @param {String} delimiter
 * @return {Config}
 */
Config.prototype.addArgv = function(prefix, delimiter) {
    this.storageSet.addArgv(prefix, delimiter);
    return this;
};

/**
 * Load to config file values from environment.
 *
 * Values are added with `append` method, which means, that it will replace
 * any existing values.
 *
 * @param {String} prefix
 * @param {String} delimiter
 * @return {Config}
 */
Config.prototype.addEnv = function(prefix, delimiter) {
    this.storageSet.addEnv(prefix, delimiter);
    return this;
};

/**
 * Add values both from command line arguments and environment
 *
 * @param {String} prefix
 * @param {String} delimiter
 * @return {Config}
 */
Config.prototype.addSystem = function(prefix, delimiter) {
    return this.addArgv(prefix).addEnv(prefix, delimiter);
};

/**
 * Prepend file or object to config.
 * All new values do not replace existing ones
 *
 * @param {String|Object} data
 * @param {String} name - optional name to store it under, so object or
 *                 file can be removed later
 * @return {Config}
 */
Config.prototype.prepend = function(data, name) {
    this.storageSet.prepend(this.loader.load(data), name);
    return this;
};

/**
 * Append file or object to config.
 * All added values DO replace existing ones
 *
 * @param {String|Object} data
 * @param {String} name - optional name to store it under, so object or
 *                 file can be removed later
 * @return {Config}
 */
Config.prototype.append = function(data, name) {
    this.storageSet.append(this.loader.load(data), name);
    return this;
};

/**
 * Add file or object to config to serve as default values.
 * Only one default set of values can exist in config file, all futher
 * calls to default method will replace previosly added ones.
 *
 * @param {String|Object} data
 * @return {Config}
 */
Config.prototype.defaults = function(data) {
    this.storageSet.defaults(this.loader.load(data));
    return this;
};

/**
 * Remove data from config file, that was added before with given name
 *
 * @param {String} name
 * @return {Config}
 */
Config.prototype.remove = function(name) {
    this.storageSet.remove(name);
    return this;
};

/**
 * Get result configuration literal object or one value.
 * ':' is used for namespace seperation, i.e key:subkey maps to value
 * of property 'subkey' of object, that stored under 'key'.
 *
 * @param {String} [path]
 * @return {Object}
 */
Config.prototype.get = function(path) {
    return this.storageSet.get(path);
};

/**
 * Set value for given path.
 * ':' is used for namespace separation, @see .get() for more info.
 *
 * @param {String} path
 * @param {Object} value
 */
Config.prototype.set = function(path, value) {
    this.storageSet.set(path, value);
    return this;
};

/**
 * Create a new config object based on current one
 *
 * @return {Config}
 */
Config.prototype.copy = function() {
    return new Config(this.get());
};
