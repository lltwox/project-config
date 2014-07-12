var Config = require('../lib');

describe('Config.prototype.addEnv', function() {
    it('should add env variables to config', function() {
        var config = new Config();
        config.addEnv();

        var envKey = Object.keys(process.env)[0],
            envValue = process.env[envKey];

        config.get(envKey).should.equal(envValue);
    });

    it('should support namespaced keys', function() {
        process.env['test:key'] = 'value';

        var config = new Config();
        config.addEnv();

        config.get('test').key.should.equal('value');

        delete process.env['test:key'];
    });
});

describe('Config.prototype.addArgv', function() {
    it('should add argv variables to config', function() {
        process.argv.push('--key=value');
        var config = new Config();
        config.addArgv();

        config.get('key').should.equal('value');

        process.argv.pop();
    });

    it('should support namespaced keys', function() {
        process.argv.push('--test:key=value');

        var config = new Config();
        config.addArgv();

        config.get('test').key.should.equal('value');

        process.argv.pop();
    });
});

describe('Config.prototype.addSystem', function() {
    it('should add values from both argv and env', function() {
        process.env.envkey = 'envvalue';
        process.argv.push('--argvkey=argvvalue');

        var config = new Config();
        config.addSystem();

        config.get('argvkey').should.equal('argvvalue');
        config.get('envkey').should.equal('envvalue');

        delete process.env.envKey;
        process.argv.pop();
    });
});