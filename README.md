project-config
==============

`project-config` is a configuration tool, capable of handling configs for complex projects with many running environments. If you have node application with several different processes, sharing parts of configuration, this tool can be a good fit for you.

## Features
- Json-based configuration
- Loading of config files' names can be controlled via environment
- Config files for different environments can be stored in different directories
- Via usage of append() and prepend() methods, application's configuration can be precisely tuned and even changed in runtime
- Thanks to [jsonminify](https://github.com/fkei/JSON.minify) config files can contain any comments needed to help undetstand meaning of the options
- Can produce js literal object (object created with literal notaion, also called hash and so many other names), that can be used as configuration for any libraries and existing projects
- Intented to be used at the start-up of application, so it is designed to be synchronous to simplify the code

## Example
With given file structure:
```
app.js
configs
    defaults.json
    app.development.json
    app.production.json
```
Configs beeing:
```json
// defaults.json
{
    // database access parameters
    "db": {
        "provider": "mysql"
        "host": "localhost",
        "port": "3306",
        "database": "app"
        "user": "app",
        "password": ""
    },
    // whether cache is enabled
    "cache": true,
    // logging level
    "logLevel": "info"
}
```
```json
// app.development.json
{
    "db": {
        "database": "app_dev"
    },
    "cache": false,
    "logLevel": "debug"
}
```
```json
// app.production.json
{
    "db": {
        "host": "...",
        "password": "..."
    },
    "logLevel": "warning"
}
```
And code:
```js
var Config = require('project-config');
Config.init();

var config = new Config('app');
config.prepend('defaults');

console.log(config.get());
```
Running `node app --config-base-dir=configs --config-env=development` will result in:
```json
{
    "db": {
        "provider": "mysql"
        "host": "localhost",
        "port": "3306",
        "database": "appDev"
        "user": "app",
        "password": ""
    },
    "cache": false,
    "logLevel": "debug"
}
```
And when in production and running `node app --config-base-dir=configs --config-env=production` will result in:
```json
{
    "db": {
        "provider": "mysql"
        "host": "...",
        "port": "3306",
        "database": "app"
        "user": "app",
        "password": "..."
    },
    "cache": true,
    "logLevel": "warning"
}
```

## How to start
1. Install it
```
npm install project-config
```

2. Require and use it
```js
var Config = require('project-config');
var config = new Config('/path/to/config/file');

console.log(config.get('resources:db:url'));
```

## Api
### Config(file)
Create configuration management class. Constructor accepts optional argument `data` with data to initialize config. New internal store will be created for it with `main` name. It can be removed or replaced later.
#### Data loading
All methods, that loads new data accept one parameter, that can be either a string or an object.

- A string, is treated as a path to config file to load. By default files is searched relative to current process's working directory (where node process was started) or by absolute path (if it was provided). `.json` suffix is not necessary. **Note**: as of 2.0.0, there are 3 files, that are tried for loading: file with suffix, set via `env` variable (see below), file without suffix, file with `defaults` suffix. All files, that are found are loaded automatically.
- Object is simply added as is.

### Config.getBaseDir(dir), Config.setBaseDir(dir), Config.unsetBaseDir(dir), Config.getEnv(env), Config.setEnv(env), Config.unsetEnv(env)
These six methods affect how and which files are loaded. There are two options: `base-dir` and `env`.

`base-dir` affects path, from where files are loaded. It can be used as a shortcut for all loaded config files by setting it to common prefix, i.e: `Config.setBaseDir('./configs/'); config.add('cluster');` will result in loading of `configs/cluster.json` file. Also it can be used to load all files from outside your git repository, which can be helpfull for productino environments.

`env` affects suffix added to config filename. I.e: `Config.setEnv('test'); config.add('cluster');` will result in loading of `cluster.test.json` file.

### Config.init()
Reads `env`  value from from `--config-env` command line argument, `NODE_ENV` and `CONFIG_ENV` environment variables and `base-dir` value from `--config-base-dir` command line argument and `CONFIG_BASE_DIR` environment variable.

### Config.prototype.addEnv()
Adds all environment varibales to current configuration.
`:` is used as namespace separator, i.e `test:key=value` will result in `{test:{key: value}}`

### Config.prototype.addArgv()
Adds all command-line arguments to current configuration. `:` is used as namespace separator.

### Config.prototype.addSystem()
Calls both addArgv() and addEnv()

### Config.prototype.prepend(data, name)
Add data to current config file. New values do not replace existing ones. `data` param follows same rules as described in constructor. `name` param is optional and gives a name for new store, so it can be removed later.

### Config.prototype.append(data, name)
Same as .add(), but new values replace existing ones.

### Config.prototype.defaults(data)
Add default storage, that always in front of all others. Only one default storage can exists, so more than one call to this method will overwrite previously added data.

### Config.prototype.remove(name)
Remove previously added store by name.

### Config.prototype.get(key)
Get value of the key. `:` is used for namespace separation. If no key provided, whole config will returned as object.

### Config.prototype.set(key, value)
Set value for the key. `:` is used for namespace separation. Set always overwrites existing values.

### Config.prototype.copy()
Create a deep copy of config object. There will be no links between old and new one.

## Contributing
Found a bug, have a feature proposal or want to add a pull request? All are welcome. Just go to issues and write it down.