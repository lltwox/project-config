var Config = require('../lib');

describe('Config.Loader', function() {
    it('should load and merge env file, normal and default files', function() {
        process.env.NODE_ENV = 'development';

        Config.setEnv('development');
        var config = new Config('test/configs/simple');
        config.get('key').should.equal('development-value');
        config.get('key2').should.equal('value2');
        config.get('key3').should.equal('value3-default');

        Config.unsetEnv();
    });
});