var Config = require('../lib'),
    fs = require('fs'),
    os = require('os');


describe('Config', function() {
    it('should load literal config objects', function() {
        var config = new Config({key: 'value'});
        config.get('key').should.equal('value');
    });

    it('should load local file', function() {
        var config = new Config('test/configs/simple');
        config.get('key').should.equal('value');
    });

    it('should ignore json extension', function() {
        var config = new Config('test/configs/simple.json');
        config.get('key').should.equal('value');
    });

    it('should load file with comments', function() {
        var config = new Config('test/configs/simple-with-comments');
        config.get('key').should.equal('value');
    });

    it('should load files by absolute path', function() {
        var tempfilename = os.tmpdir() + 'project-config-test.json';
        fs.writeFileSync(
            tempfilename, fs.readFileSync('test/configs/simple.json')
        );

        var config = new Config(tempfilename);
        config.get('key').should.equal('value');

        fs.unlink(tempfilename);
    });

    it('should name default storage', function() {
        var config = new Config({key: 'value'});
        config.remove('main');
        (config.get('key') === undefined).should.be.true;
    });
});
