const { Database, LogVariant, Credentials, Client } = require('@dulliag/logger.js');
require('dotenv').config();

try {
  const credentials = new Credentials(
    process.env.DB_HOST,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    process.env.DB_DATABASE
  );

  const LOGGER = new Client(Database.PG, credentials, 'DulliBot');

  /**
   *
   * @param {LogVariant} variant
   * @param {string} code
   * @param {string} message
   */
  const createLog = (variant, code, message) => {
    return process.env.PRODUCTION == 'true' ? LOGGER.log(variant, code, message) : null;
  };

  module.exports = {
    logType: LogVariant,
    logger: LOGGER,
    createLog: createLog,
  };
} catch (err) {
  console.log(err);
}
