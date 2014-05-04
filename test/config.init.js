var Config = require('../lib');
require('should');

describe('config.init', function() {
    var nodeEnvValue;

    beforeEach(function() {
        nodeEnvValue = process.env.NODE_ENV;
        delete process.env.NODE_ENV;
    });

    afterEach(function() {
        process.env.NODE_ENV =nodeEnvValue;
    });

    it('should load env value from env variable NODE_ENV', function() {
        process.env.NODE_ENV = 'development';

        Config.init();
        var config = new Config('test/configs/simple');
        config.get('key').should.equal('development-value');

        Config.unsetEnv();
        Config.unsetBaseDir();

        delete process.env.NODE_ENV;
    });

    it('should load env value from env variable CONFIG_ENV', function() {
        process.env.CONFIG_ENV = 'development';

        Config.init();
        var config = new Config('test/configs/simple');
        config.get('key').should.equal('development-value');

        Config.unsetEnv();
        Config.unsetBaseDir();
        delete process.env.CONFIG_ENV;
    });

    it('should load base-dir value from env variable CONFIG_BASE_DIR', function() {
        process.env.CONFIG_BASE_DIR = 'test/configs';

        Config.init();
        var config = new Config('simple');
        config.get('key').should.equal('value');

        Config.unsetEnv();
        Config.unsetBaseDir();
        delete process.env.CONFIG_BASE_DIR;
    });

    it('should load env value from argv --config-env', function() {
        process.argv.push('--config-env=development');

        Config.init();
        var config = new Config('test/configs/simple');
        config.get('key').should.equal('development-value');

        Config.unsetEnv();
        Config.unsetBaseDir();
        process.argv.pop();
    });

    it('should load base-dir value from argv --config-base-dir', function() {
        process.argv.push('--config-base-dir=test/configs');

        Config.init();
        var config = new Config('simple');
        config.get('key').should.equal('value');

        Config.unsetBaseDir();
        process.argv.pop();
    });
});

describe('config.setBaseDir', function() {
    it('should set base dir for files to be loaded from', function() {
        Config.setBaseDir(__dirname + '/configs');
        var config = new Config('simple');

        config.get('key').should.equal('value');

        Config.unsetBaseDir();
    });
});

describe('config.setEnv', function() {
    it('should set evironment suffix for loaded files', function() {
        Config.setEnv('development');
        var config = new Config('test/configs/simple');

        config.get('key').should.equal('development-value');

        Config.unsetEnv();
    });
});