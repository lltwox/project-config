exports = module.exports = Storage;

/**
 * Storage for one config object
 *
 * @param {Object} data
 * @param {String} type
 * @param {String} delimiter
 */
function Storage(data, type, delimiter) {
    this.data = data;
    this.type = type;
    this.setDelimiter(delimiter);
}

/**
 * Default namespace delimiter for keys
 *
 * @type {String}
 */
Storage.DEFAULT_DELIMITER = ':';

/**
 * Get type of store
 *
 * @return {String}
 */
Storage.prototype.getType = function() {
    return this.type;
};

/**
 * Set delimiter to user
 *
 * @param {String} delimiter
 */
Storage.prototype.setDelimiter = function(delimiter) {
    this.delimiter = delimiter || Storage.DEFAULT_DELIMITER;
    this.trimRegexp = new RegExp(
        '^' + this.delimiter + '+|' + this.delimiter + '+$', 'g'
    );
    this.repeatRegexp = new RegExp(
        this.delimiter + this.delimiter + '+', 'g'
    );
};

/**
 * Get value from store
 *
 * @param {String} path
 * @return {Object}
 */
Storage.prototype.get = function(path) {
    if (!path) return this.data;

    var parsed = this.parsePath(path),
        target = this.data,
        key;

    while (parsed.length > 0) {
        key = parsed.shift();
        if (target && target.hasOwnProperty(key)) {
            target = target[key];
            continue;
        }
        return undefined;
    }

    return target;
};

/**
 * Set value in store
 *
 * @param {String} path
 * @param {String|Object} value
 */
Storage.prototype.set = function(path, value) {
    if (!path) {
        this.data = value;
        return;
    }

    var parsed = this.parsePath(path),
        target = this.data,
        key;

    while (parsed.length > 1) {
        key = parsed.shift();
        if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
        }

        target = target[key];
    }

    key = parsed.shift();
    target[key] = value;
};

/**
 * @param {String} path
 * @return {Array}
 * @private
 */
Storage.prototype.parsePath = function(path) {
    return path
        .replace(this.trimRegexp, '')
        .replace(this.repeatRegexp, this.delimiter)
        .split(this.delimiter);
};