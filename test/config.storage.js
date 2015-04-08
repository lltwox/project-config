var Config = require('../lib');

describe('Config.Storage', function() {
    it('should ignore trailing delimiters in key paths', function() {
        var config = new Config({
            key: 'value',
            namespace: {
                key: 'value2'
            }
        });

        config.get('key:').should.equal('value');
    });

    it('should ignore preceding delimiters in key paths', function() {
        var config = new Config({
            key: 'value',
            namespace: {
                key: 'value2'
            }
        });

        config.get(':key').should.equal('value');
    });

    it('should ignore duplice delimiters in key paths', function() {
        var config = new Config({
            key: 'value',
            namespace: {
                key: 'value2'
            }
        });

        config.get(':namespace::key:').should.equal('value2');
    });

    it('should ignore extra delimiters when setting values', function() {
        var config = new Config({
            key: 'value',
            namespace: {
                key: 'value2'
            }
        });
        config.set(':::namespace::key::', 'value3');

        config.get('namespace::key').should.equal('value3');
    });

    it('should ignore extra delimiters in links', function() {
        var config = new Config({
            key: 'value',
            namespace: {
                key: 'value2'
            }
        });
        config.set('namespace2:key2', '@:::::namespace::key::');

        config.get('namespace2:key2').should.equal('value2');
    });
});