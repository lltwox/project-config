var Config = require('../lib');

describe('Config complex use-case: ', function() {
    it('multiple prepend and append calls should work', function() {
        var config = new Config();

        config.append({
            a: 10,
            b: 20
        });

        config.prepend({
            a: 11,
            c: 30
        });

        config.append({
            b: 19,
            d: 40
        });

        config.prepend({
            c: 31,
            e: 50
        });

        config.get('a').should.equal(10);
        config.get('b').should.equal(19);
        config.get('c').should.equal(30);
        config.get('d').should.equal(40);
        config.get('e').should.equal(50);
    });

    it('multiple prepend and append with same stores should work', function() {
        var config = new Config();

        config.append({
            a: 10,
            b: 20
        }, 'store-1');

        config.prepend({
            a: 11,
            c: 30
        }, 'store-1');

        config.prepend({
            c: 31,
            e: 50
        }, 'store-2');

        config.append({
            b: 19,
            d: 40
        }, 'store-2');

        config.get('a').should.equal(11);
        config.get('b').should.equal(19);
        config.get('c').should.equal(30);
        config.get('d').should.equal(40);
        (config.get('e') === undefined).should.be.true;
    });

    it('reusing parts of config should work', function() {
        var config = new Config({
            defaults: {
                a: 10,
                b: 20,
                c: 30
            },
            app1: {
                a: 11
            },
            app2: {
                a: 12,
                b: 22
            },
            app3: {
                b: 23,
                c: 33
            }
        });

        config.prepend(config.get('defaults'));

        config.append(config.get('app1'), 'app');
        config.get('a').should.equal(11);
        config.get('b').should.equal(20);
        config.get('c').should.equal(30);

        config.append(config.get('app2'), 'app');
        config.get('a').should.equal(12);
        config.get('b').should.equal(22);
        config.get('c').should.equal(30);

        config.append(config.get('app3'), 'app');
        config.get('a').should.equal(10);
        config.get('b').should.equal(23);
        config.get('c').should.equal(33);
    });

    it('string values should overwrite objects', function() {
        var config = new Config({
            a: {
                b: 10
            }
        });
        config.append({
            a: 'value'
        });

        config.get('a').should.equal('value');
    });

    it('object values should overwrite simple values', function() {
        var config = new Config({
            a: 'value'
        });
        config.append({
            a: {
                b: 10
            }
        });

        config.get('a:b').should.equal(10);
    });

    it('complex objects should merge', function() {
        var config = new Config({
            a: 'value'
        });
        config.append({
            a: {
                b: 10
            }
        });

        config.get('a:b').should.equal(10);
    });
});