var Config = require('../lib'),
    should = require('should');

describe('config.get', function() {
    it('should return whole config as literal', function() {
        var config = new Config({
            key: 'value',
            anotherKey: 'anotherValue',
            namespace: {
                key: 'value'
            }
        });

        config.get().should.eql({
            key: 'value',
            anotherKey: 'anotherValue',
            namespace: {
                key: 'value'
            }
        });
    });

    it('should return correct value for key', function() {
        var config = new Config({
            key: 'value'
        });

        config.get('key').should.equal('value');
    });

    it('should return correct namespaced key', function() {
        var config = new Config({
            key: 'value',
            namespace: {
                key: 'different-value'
            }
        });

        config.get('key').should.equal('value');
        config.get('namespace:key').should.equal('different-value');
    });
});

describe('config.copy', function() {
    it('should return copy of config', function() {
        var config = new Config({key: 'value'});
        config.copy().get().should.eql({key: 'value'});
    });

    it('should make deep copy', function() {
        var config = new Config({
            key: 'value',
            namespace: {
                key: 'different-value'
            }
        });

        var copy = config.copy();
        config.remove('main');

        copy.get().should.eql({
            key: 'value',
            namespace: {
                key: 'different-value'
            }
        });
    });
});

describe('config.remove', function() {
    it('should remove existing stores', function() {
        var config = new Config();
        config.add({key: 'value'}, 'added-store');

        config.remove('added-store');
        should(config.get('key')).not.be.ok;
    });
});