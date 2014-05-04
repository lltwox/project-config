var Config = require('../lib'),
    should = require('should');

describe('config.use', function() {
    it('should add new values', function() {
        var config = new Config({key: 'value'});
        config.use({key2: 'value2'});

        config.get('key').should.equal('value');
        config.get('key2').should.equal('value2');
    });

    it('should overwrite existing values', function() {
        var config = new Config({key: 'value'});
        config.use({key: 'different-value'});

        config.get('key').should.equal('different-value');
    });

    it('should add stores, that can be removed', function() {
        var config = new Config({key: 'value'});
        config.use({key2: 'value2'}, 'added-store');

        config.remove('added-store');
        should(config.get('key2')).be.not.ok;
    });
});