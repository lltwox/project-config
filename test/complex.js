var Config = require('../lib'),
    should = require('should');

describe('Complex use-case: ', function() {
    it('multiple add and use calls should work', function() {
        var config = new Config();

        config.use({
            a: 10,
            b: 20
        });

        config.add({
            a: 11,
            c: 30
        });

        config.use({
            b: 19,
            d: 40
        });

        config.add({
            c: 31,
            e: 50
        });

        config.get('a').should.equal(10);
        config.get('b').should.equal(19);
        config.get('c').should.equal(30);
        config.get('d').should.equal(40);
        config.get('e').should.equal(50);
    });

    it('multiple add and use with same stores should work', function() {
        var config = new Config();

        config.use({
            a: 10,
            b: 20
        }, 'store-1');

        config.add({
            a: 11,
            c: 30
        }, 'store-1');

        config.add({
            c: 31,
            e: 50
        }, 'store-2');

        config.use({
            b: 19,
            d: 40
        }, 'store-2');

        config.get('a').should.equal(11);
        config.get('b').should.equal(19);
        config.get('c').should.equal(30);
        config.get('d').should.equal(40);
        should(config.get('e')).not.be.ok;
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

        config.add(config.get('defaults'));

        config.use(config.get('app1'), 'app');
        config.get('a').should.equal(11);
        config.get('b').should.equal(20);
        config.get('c').should.equal(30);

        config.use(config.get('app2'), 'app');
        config.get('a').should.equal(12);
        config.get('b').should.equal(22);
        config.get('c').should.equal(30);

        config.use(config.get('app3'), 'app');
        config.get('a').should.equal(10);
        config.get('b').should.equal(23);
        config.get('c').should.equal(33);
    });
});