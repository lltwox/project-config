var Config = require('../lib');

describe('Config.prototype.append', function() {
    it('should add new values', function() {
        var config = new Config({key: 'value'});
        config.append({key2: 'value2'});

        config.get('key').should.equal('value');
        config.get('key2').should.equal('value2');
    });

    it('should overwrite existing values', function() {
        var config = new Config({key: 'value'});
        config.append({key: 'different-value'});

        config.get('key').should.equal('different-value');
    });

    it('should add stores, that can be removed', function() {
        var config = new Config({key: 'value'});
        config.append({key2: 'value2'}, 'added-store');

        config.remove('added-store');
        (config.get('key2') === undefined).should.be.true;
    });
});