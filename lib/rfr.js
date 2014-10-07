/**
 * The main file of node-rfr.
 *
 * @author Su Su <s@warmsea.net>
 */

/**
 * Trim a root and add tailing slash if not exists.
 * @param {String} root A root.
 * @returns {String} The coerced root.
 * @private
 */
function coerceRoot(root) {
  var coerced = root.toString().trim();
  var len = coerced.length;
  if (len > 0 && coerced[len - 1] !== '/') {
    coerced = coerced + '/';
  }
  return coerced;
}

/**
 * Return a module id which can be used by the builtin `require()`.
 * @param {String} idFromRoot A RFR module id.
 * @param {String} root The root.
 * @returns {String} A standard module id.
 * @private
 */
function normalizeId(idFromRoot, root) {
  var id = idFromRoot.toString().trim();
  if (root && id.length > 0 && id[0] === '/') {
    id = id.substring(1);
  }
  id = root + id;
  return id;
}

/**
 * Create a new version of rfr with a function.
 * @param {Function} callable The rfr require function.
 * @param {String} root The root for rfr require.
 * @private
 */
var createRfr = function(callable, root) {
  rfr = callable.bind(callable);

  rfr.setRoot = function(root) {
    callable.root = coerceRoot(root);
  };

  rfr.setRoot(root);
  return rfr;
};

/**
 * Create a new version of rfr.
 * @param {{root:String}} config config of this version.
 * @returns {rfr} a new rfr version.
 * @private
 */
function createVersion(config) {
  if (!(config || (typeof config.root !== 'string'))) {
    throw new Error('"config.root" is required and must be a string');
  }

  return createRfr(function(idFromRoot) {
    if (typeof idFromRoot !== 'string') {
      throw new Error('A string is required for the argument of ' +
          'a user created RFR version.');
    }
    return require(normalizeId(idFromRoot, this.root));
  }, config.root);
}

/**
 * Do the RFR require action, or create a new version of RFR.
 * If a string is passed as the argument, this function will do the RFR require
 * action. Else, this function will create a new version of RFR with the
 * argument as config.
 * @function
 * @param {String|Object} idFromRoot Module id or RFR config.
 * @returns {Module|RFR} A module or a RFR version.
 */
var rfr = createRfr(function(idFromRoot) {
  if (typeof idFromRoot === 'string') {
    return require(normalizeId(idFromRoot, this.root));
  } else {
    return createVersion(idFromRoot);
  }
}, process.env.RFR_ROOT || process.env.PWD || process.cwd() || '/');

module.exports = rfr;