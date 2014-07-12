var Config = require('../lib');

describe('Config.prototype.prepend', function() {
    it('should add new values', function() {
        var config = new Config({key: 'value'});
        config.prepend({key2: 'value2'});

        config.get('key').should.equal('value');
        config.get('key2').should.equal('value2');
    });

    it('should not overwrite existing values', function() {
        var config = new Config({key: 'value'});
        config.prepend({key: 'different value'});

        config.get('key').should.equal('value');
    });

    it('should add stores, that can be removed', function() {
        var config = new Config({key: 'value'});
        config.prepend({key2: 'value2'}, 'added-store');

        config.remove('added-store');
        (config.get('key2') == undefined).should.be.true;
    });

    it('should overwrite existing store', function() {
        var config = new Config();
        config.prepend({key: 'value'}, 'added-store');
        config.prepend({key: 'different-value'}, 'added-store');

        config.get('key').should.equal('different-value');
    });

    it('should overwrite existing store and remove previous one', function() {
        var config = new Config();
        config.prepend({key: 'value'}, 'added-store');
        config.prepend({key: 'different-value'}, 'added-store');
        config.remove('added-store');

        (config.get('key') === undefined).should.be.true;
    });
});