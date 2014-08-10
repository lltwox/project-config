exports = module.exports = Loader;

var fs = require('fs'),
    jsonminify = require('jsonminify'),
    _ = require('lodash');

/**
 * Class, that can load new data to add to config
 *
 * @param {String} baseDir
 * @param {String} env
 */
function Loader(baseDir, env) {
    this.baseDir = baseDir;
    this.suffix = env;
}

/**
 * Load object from given data
 *
 * @param {String|Object} data
 * @return {Object}
 */
Loader.prototype.load = function(data) {
    if (typeof data == 'string') return this.loadJson(data);
    if (typeof data == 'object') return _.cloneDeep(data);
    if (!data) return {};

    throw new Error(
        'Invalid parameter: path or literal object expected'
    );
};

/**
 * Load json file
 *
 * @param  {String} filepath
 * @return {Object}
 * @private
 */
Loader.prototype.loadJson = function(filepath) {
    filepath = this.formatPath(filepath);

    var file = fs.readFileSync(filepath, 'utf8');
    var json;
    try {
        json = JSON.parse(jsonminify(file));
    } catch (err) {
        throw new Error('Invalid json file ' + filepath + ': ' + err.message);
    }

    return json;
};

/**
 * @param {String} filepath
 * @return {String}
 */
Loader.prototype.formatPath = function(filepath) {
    if (filepath.indexOf('.json') >= 0) {
        filepath = filepath.substr(0, filepath.indexOf('.json'));
    }

    if (this.baseDir) filepath = this.baseDir + '/' + filepath;
    if (this.suffix) {
        var suffixedPath = filepath + '.' + this.suffix + '.json';
        try {
            this.checkPath(suffixedPath);
            return suffixedPath;
        } catch(err) {
            // file with suffix not found
        }
    }

    filepath += '.json';
    this.checkPath(filepath);

    return filepath;
};

/**
 * @param {String} filepath
 */
Loader.prototype.checkPath = function(filepath) {
    if (!fs.existsSync(filepath)) {
        throw new Error('File not found: ' + filepath);
    }
    if (!fs.statSync(filepath).isFile()) {
        return new Error('Invalid file: ' + filepath);
    }
};