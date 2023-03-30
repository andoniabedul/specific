var contextPath,
  cargo = {},
  aliases = {},
  path = require("path"),
  util = require("util"),
  current = __dirname,
  commonDirectory = "common",
  resolverActive = false,
  root = path.resolve(current, "../..");

module.exports = {
  require: function (filepath) {
    return require(path.resolve(root, filepath));
  },

  set: function (varName, info) {
    cargo[varName] = info;
  },

  get: function (varName) {
    return cargo[varName];
  },

  setContextPath: function (r) {
    contextPath = r;
    root = path.resolve(root, r);
  },

  getPath: function (directory) {
    return path.resolve(root, directory || "");
  },

  addPath: function (alias, directory, commonDir) {
    aliases[alias] = directory;
    const wrapper = this.require;
    if (commonDir) {
      commonDirectory = commonDir;
    }
    this.require[alias] = function (filepath) {
      const resolved = resolverActive
        ? resolver(aliases[alias], filepath)
        : path.resolve(root, directory, filepath || "");
      return wrapper(resolved);
    };
    this.getPath[alias] = function (filepath) {
      return resolverActive
        ? resolver(aliases[alias], filepath)
        : path.resolve(root, directory, filepath || "");
    };
  },

  setResolver: function (isActive) {
    resolverActive = isActive;
  },
};

function resolver(directory, filepath) {
  const [basePath, subPath] = filepath.split(/[/](.*)/, 2);
  const possibleModules = [
    [
      subPath ? basePath : commonDirectory,
      directory,
      subPath ? subPath : basePath,
    ],
    [commonDirectory, directory, basePath, subPath],
    [basePath, directory],
  ].map((posibleModule) => posibleModule.join("/"));
  const resolved = possibleModules.map(findModulePath).find(Boolean);
  if (!resolved) {
    const message = util.format(
      "[SPECIFIC ERROR] Not module found %s in %s",
      filepath,
      directory,
      possibleModules
    );
    const error = new Error(message);
    error.code = "MODULE_NOT_FOUND";
    throw error;
  }
  return resolved;
}

function findModulePath(posiblePath) {
  const absolutePath = path.resolve(root, posiblePath);
  return resolve(absolutePath);
}

function resolve(path) {
  try {
    return require.resolve(path);
  } catch (_error) {
    return undefined;
  }
}
