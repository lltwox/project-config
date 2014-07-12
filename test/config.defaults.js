var Config = require('../lib');

describe('Config.prototype.defaults', function() {
    it('should add default values', function() {
        var config = new Config({key: 'value'});
        config.defaults({key2: 'value2'});

        config.get('key').should.equal('value');
        config.get('key2').should.equal('value2');
    });

    it('should not replace added values', function() {
        var config = new Config({key: 'value'});
        config.prepend({key2: 'value2'});
        config.defaults({key2: 'default'});

        config.get('key').should.equal('value');
        config.get('key2').should.equal('value2');
    });

    it('should not replace used values', function() {
        var config = new Config({key: 'value'});
        config.prepend({key2: 'value2'});
        config.defaults({key2: 'default'});

        config.get('key').should.equal('value');
        config.get('key2').should.equal('value2');
    });

    it('should replace old defaults store', function() {
        var config = new Config();
        config.defaults({key: 'default-one'});
        config.defaults({key: 'default-two'});
        config.prepend({addedkey: 'value'});

        config.get('key').should.equal('default-two');
    });

    it('should be removed with remove', function() {
        var config = new Config();
        config.defaults({key: 'default-one'});
        config.remove('defaults');

        (config.get('key') === undefined).should.be.true;
    });
});