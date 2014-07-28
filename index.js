var contextPath,
    cargo = {},
    aliases = {},
    path = require('path'),
    current = __dirname,
    root = path.resolve(current, '../..');

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

  addPath: function(alias, directory) {
    aliases[alias] = directory;
    var wrapper = this.require;
    this.require[alias] = function(filepath) {
      return wrapper(path.resolve(root, directory, filepath || ''));
    }

    this.getPath[alias] = function(filepath) {
      return path.resolve(root, directory, filepath || '');
    }
  }
}
