var Config = require('../lib'),
    should = require('should');

describe('config.add', function() {
    it('should add new values', function() {
        var config = new Config({key: 'value'});
        config.add({key2: 'value2'});

        config.get('key').should.equal('value');
        config.get('key2').should.equal('value2');
    });

    it('should not overwrite existing values', function() {
        var config = new Config({key: 'value'});
        config.add({key: 'different value'});

        config.get('key').should.equal('value');
    });

    it('should add stores, that can be removed', function() {
        var config = new Config({key: 'value'});
        config.add({key2: 'value2'}, 'added-store');

        config.remove('added-store');
        should(config.get('key2')).be.not.ok;
    });

    it('should overwrite existing store', function() {
        var config = new Config();
        config.add({key: 'value'}, 'added-store');
        config.add({key: 'different-value'}, 'added-store');

        config.get('key').should.equal('different-value');
    });

    it('should overwrite existing store and remove previous one', function() {
        var config = new Config();
        config.add({key: 'value'}, 'added-store');
        config.add({key: 'different-value'}, 'added-store');
        config.remove('added-store');

        should(config.get('key')).not.be.ok;
    });
});