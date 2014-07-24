var path    = require('path');
var current = __dirname;
var root    = path.resolve(current, '../..');
module.exports = {
  require: function(filepath) {
    return require(path.resolve(root, filepath));
  },

  setRoot: function(r) {
    root = r;
  },

  addRequireAlias: function(alias, directory) {
    var wrapper = this.require;
    this.require[alias] = function(filepath) {
      return wrapper(path.resolve(directory, filepath));
    }
  }
}
