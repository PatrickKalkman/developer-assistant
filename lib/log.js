/*
 * Logging wrapper
 */
const logger = require('pino')({ prettyPrint: true });

const lib = {};

lib.info = function info(message) {
  logger.info(message);
};

lib.error = function error(message) {
  logger.error(message);
};

lib.debug = function debug(message) {
  logger.debug(message);
};

module.exports = lib;
