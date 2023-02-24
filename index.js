var contextPath,
    cargo = {},
    aliases = {},
    path = require('path'),
    current = __dirname,
    commonDirectory = 'common',
    resolverActive = false,
    root = path.resolve(current, '../..');


const _resolve = function (paths) {
  return path.resolve(root, paths.join('/'))
};

const _isModule = function(path){ 
  try {
    require.resolve(path);
    return true;
  } catch (e) {
    return false;
  }
}

const _findModulePath = function(possibleModule, extension) {
  const resolved = _resolve(possibleModule) + extension;
  return _isModule(resolved) ? resolved : null;
}

module.exports = {
  require: function(filepath) {
    return require(path.resolve(root, filepath));
  },

  set: function(varName, info) {
    cargo[varName] = info;
  },

  get: function(varName) {
    return cargo[varName];
  },

  setContextPath: function(r) {
    contextPath = r;
    root = path.resolve(root, r);
  },

  getPath: function(directory) {
    return path.resolve(root, directory || '');
  },

  isModule: function(path){ 
    try {
      require.resolve(path);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  resolve: function (paths) {
    return path.resolve(root, paths.join('/'))
  },
  resolver: function(directory, filepath) {
    const paths = filepath.split('/');
    let possibleModules = [
      [
        paths.length === 1 ? commonDirectory : paths[0], 
        directory, 
        ...Array.from(paths).slice(paths.length === 1 ? 0 : 1)
      ],
      [
        commonDirectory,
        directory,
        paths.join('/')
      ],
      [
        paths[0], 
        directory
      ],
    ];
    const resolved = possibleModules.map((possibleModule) => {
      return [
        _findModulePath(possibleModule, '.js'),
        _findModulePath(possibleModule, '/index.js'),
        _findModulePath(possibleModule, ''),
      ].find(Boolean);
    }).find(Boolean);
    if(!resolved){    
      global.logger.error(
        '[SPECIFIC ERROR] Not module found %s in %s',
        filepath, 
        directory
      );
      global.logger.info(
        possibleModules.map(
          (list) => list.map((path) => path.join('/'))
        )
      );
    }
    return resolved;
  },

  addPath: function(alias, directory, commonDir) {
    aliases[alias] = directory;
    const self = this;
    var wrapper = this.require;
    if(commonDir) commonDirectory = commonDir;
    this.require[alias] = function(filepath) {
      const resolved = resolverActive ? 
        self.resolver(aliases[alias], filepath) :
        path.resolve(root, directory, filepath || '');
      return wrapper(resolved);
    }

    this.getPath[alias] = function(filepath) {
      return path.resolve(root, directory, filepath || '');
    }
  },
  
  setResolver: function(isActive){
    resolverActive = isActive;
  }
}
