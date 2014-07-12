var Config = require('../lib');

describe('Config.prototype.set', function() {
    it('should set new values', function() {
        var config = new Config();
        config.set('a', 'new-value');

        config.get('a').should.equal('new-value');
    });

    it('should overwrite existing values', function() {
        var config = new Config({
            a: 'old-value'
        });
        config.set('a', 'new-value');

        config.get('a').should.equal('new-value');
    });

    it('should set namespaced values', function() {
        var config = new Config({
            a: 'old-value'
        });
        config.set('a:b', 'new-value');

        config.get('a').should.eql({b: 'new-value'});
        config.get('a:b').should.equal('new-value');
    });

    it('should add namespaced values', function() {
        var config = new Config({
            a: {
                b: 10
            }
        });
        config.set('a:c', 20);

        config.get('a').should.eql({
            b: 10,
            c: 20
        });
    });

    it('should set root object', function() {
        var config = new Config({
            a: 10
        });
        config.set(null, 'hello');

        config.get().should.equal('hello');
    });
});