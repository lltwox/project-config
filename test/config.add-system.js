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

    it('should support simple json values', function() {
        process.env.test = 'true';

        var config = new Config();
        config.addEnv();

        config.get('test').should.equal(true);

        process.argv.pop();
    });

    it('should support complex json values', function() {
        process.env.test = '{"key":"value"}';

        var config = new Config();
        config.addEnv();

        config.get('test:key').should.equal('value');

        process.argv.pop();
    });

    it('should respect prefix', function() {
        process.env['pr:test'] = 12;

        var config = new Config();
        config.addEnv('pr');

        config.get('test').should.equal(12);

        process.argv.pop();
    });

    it('should respect alternative delimiter', function() {
        process.env.pr__test = 12;

        var config = new Config();
        config.addEnv(null, '__');

        config.get('pr:test').should.equal(12);

        process.argv.pop();
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

    it('should support simple json values', function() {
        process.argv.push('--test=true');

        var config = new Config();
        config.addArgv();

        config.get('test').should.equal(true);

        process.argv.pop();
    });

    it('should support complex json values', function() {
        process.argv.push('--test={"key":"value"}');

        var config = new Config();
        config.addArgv();

        config.get('test:key').should.equal('value');

        process.argv.pop();
    });

    it('should respect prefix', function() {
        process.argv.push('--pr:test=12');

        var config = new Config();
        config.addArgv('pr');

        config.get('test').should.equal(12);

        process.argv.pop();
    });

    it('should respect alternative delimiter', function() {
        process.argv.push('--pr__test=12');

        var config = new Config();
        config.addArgv(null, '__');

        config.get('pr:test').should.equal(12);

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