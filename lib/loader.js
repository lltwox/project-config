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
 * Suffix to check for default values
 *
 * @type {String}
 */
Loader.DEFAULT_SUFFIX = 'defaults';

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
    var filepaths = this.getPaths(filepath);
    if (!filepaths) {
        throw new Error('No suitable file found to load for path: ' + filepath);
    }

    var result = {};
    filepaths.forEach(function(filepath) {
        var file = fs.readFileSync(filepath, 'utf8');
        var json;
        try {
            json = JSON.parse(jsonminify(file));
        } catch (err) {
            throw new Error(
                'Invalid json file ' + filepath + ': ' + err.message
            );
        }

        result = _.merge(json, result);
    });

    return result;
};

/**
 * @param {String} filepath
 * @return {Array}
 * @private
 */
Loader.prototype.getPaths = function(filepath) {
    if (filepath.indexOf('.json') >= 0) {
        filepath = filepath.substr(0, filepath.indexOf('.json'));
    }

    if (this.baseDir) filepath = this.baseDir + '/' + filepath;
    var filepaths = [
        filepath + '.' + this.suffix + '.json',
        filepath + '.json',
        filepath + '.' + Loader.DEFAULT_SUFFIX + '.json'
    ];
    filepaths = filepaths.filter(this.checkPath);

    return filepaths;
};

/**
 * @param {String} filepath
 * @returns {Boolean}
 * @private
 */
Loader.prototype.checkPath = function(filepath) {
    return fs.existsSync(filepath) && fs.statSync(filepath).isFile();
};