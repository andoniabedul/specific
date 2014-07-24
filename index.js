var contextPath,
    aliases = {},
    path = require('path');
    current = __dirname,
    root = path.resolve(current, '../..');

module.exports = {
  require: function(filepath) {
    return require(path.resolve(root, filepath));
  },

  setContextPath: function(r) {
    contextPath = r;
    root = path.resolve(root, r);
  },

  getPath: function(alias) {
    if (!alias) return root;
    return aliases[alias];
  },

  addPath: function(alias, directory) {
    aliases[alias] = directory;
    var wrapper = this.require;
    this.require[alias] = function(filepath) {
      return wrapper(path.resolve(root, directory, filepath || ''));
    }
  }
}
