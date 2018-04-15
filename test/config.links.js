var Config = require('../lib');

describe('Config', function() {
    it('should support linking between values', function() {
        var config = new Config({
            key: 'value',
            key2: '@key'
        });

        config.get('key2').should.equal('value');
    });

    it('should support linking between object values', function() {
        var config = new Config({
            key: {
                a: 10,
                b: 20
            },
            key2: '@key'
        });

        config.get().should.eql({
            key: {
                a: 10,
                b: 20
            },
            key2: {
                a: 10,
                b: 20
            }
        });
    });

    it('should support namespaced links', function() {
        var config = new Config({
            key: {
                a: 10,
                b: 20
            },
            key2: '@key:a'
        });

        config.get('key2').should.equal(10);
    });

    it('should support links to other stores', function() {
        var config = new Config({
            key: {
                a: 10,
                b: 20
            }
        });
        config.set('key2', '@key:a');

        config.get('key2').should.equal(10);
    });

    it('should make links to follow stores priorities', function() {
        var config = new Config();
        config.append({key: 20});
        config.prepend({key: 10});

        config.defaults({key2: '@key'});

        config.get('key2').should.equal(20);
    });

    it('should support nested links', function() {
        var config = new Config({
            key: {
                a: 10
            },
            key2: {
                b: '@key'
            },
            key3: '@key2'
        });

        config.get('key3').should.eql({
            b: {
                a: 10
            }
        });
    });

    it('should find circular links', function() {
        var config = new Config({
            key: {
                a: '@key3'
            },
            key2: {
                b: '@key'
            },
            key3: '@key2'
        });

        (function() {
            config.get();
        }).should.throw();
    });

    it('should allow escaping link with double @ character', function() {
        var config = new Config({
            key: 10,
            key2: '@@key'
        });

        config.get('key2').should.equal('@key');
    });
});