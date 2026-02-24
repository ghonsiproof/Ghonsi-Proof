/**
 * Structured Logging Utility
 * Standardized logging across the application
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

// Get current timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Get log level color for console
const getColorForLevel = (level) => {
  const colors = {
    DEBUG: 'color: #7f8c8d',
    INFO: 'color: #3498db',
    WARN: 'color: #f39c12',
    ERROR: 'color: #e74c3c',
  };
  return colors[level] || 'color: inherit';
};

// Format log message
const formatLogMessage = (level, message, data) => {
  const timestamp = getTimestamp();
  const prefix = `[v0-${level}] [${timestamp}]`;
  
  if (data) {
    return { prefix, message, data };
  }
  return { prefix, message };
};

/**
 * Logger object with structured logging methods
 */
export const logger = {
  /**
   * Debug level logging (development only)
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'production') return;
    const { prefix, message: msg } = formatLogMessage(LOG_LEVELS.DEBUG, message, data);
    console.log(`%c${prefix}`, getColorForLevel(LOG_LEVELS.DEBUG), msg, data || '');
  },

  /**
   * Info level logging
   */
  info: (message, data = null) => {
    const { prefix, message: msg } = formatLogMessage(LOG_LEVELS.INFO, message, data);
    console.log(`%c${prefix}`, getColorForLevel(LOG_LEVELS.INFO), msg, data || '');
  },

  /**
   * Warning level logging
   */
  warn: (message, data = null) => {
    const { prefix, message: msg } = formatLogMessage(LOG_LEVELS.WARN, message, data);
    console.warn(`%c${prefix}`, getColorForLevel(LOG_LEVELS.WARN), msg, data || '');
  },

  /**
   * Error level logging
   */
  error: (message, error = null) => {
    const { prefix, message: msg } = formatLogMessage(LOG_LEVELS.ERROR, message, error);
    console.error(`%c${prefix}`, getColorForLevel(LOG_LEVELS.ERROR), msg);
    if (error) {
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      } else {
        console.error('Error details:', error);
      }
    }
  },

  /**
   * Log API call
   */
  apiCall: (method, endpoint, status, duration) => {
    const statusColor = status >= 400 ? 'color: #e74c3c' : 'color: #27ae60';
    const timestamp = getTimestamp();
    console.log(
      `%c[v0-API] [${timestamp}]`,
      statusColor,
      `${method} ${endpoint} → ${status} (${duration}ms)`
    );
  },

  /**
   * Log user action
   */
  action: (action, details = null) => {
    const timestamp = getTimestamp();
    console.log(
      `%c[v0-ACTION] [${timestamp}]`,
      'color: #9b59b6',
      action,
      details || ''
    );
  },

  /**
   * Log wallet event
   */
  wallet: (event, details = null) => {
    const timestamp = getTimestamp();
    console.log(
      `%c[v0-WALLET] [${timestamp}]`,
      'color: #1abc9c',
      event,
      details || ''
    );
  },

  /**
   * Log blockchain transaction
   */
  transaction: (action, hash, status, details = null) => {
    const statusColor = status === 'success' ? 'color: #27ae60' : 'color: #e74c3c';
    const timestamp = getTimestamp();
    console.log(
      `%c[v0-TXN] [${timestamp}]`,
      statusColor,
      `${action} (${hash}) → ${status}`,
      details || ''
    );
  },

  /**
   * Log database operation
   */
  database: (operation, table, status, details = null) => {
    const timestamp = getTimestamp();
    console.log(
      `%c[v0-DB] [${timestamp}]`,
      'color: #34495e',
      `${operation} on ${table} → ${status}`,
      details || ''
    );
  },

  /**
   * Group related logs
   */
  groupStart: (groupName) => {
    console.group(`[v0] ${groupName}`);
  },

  groupEnd: () => {
    console.groupEnd();
  },
};

/**
 * Performance timing utility
 */
export const performance = {
  marks: {},

  start: (label) => {
    performance.marks[label] = Date.now();
    logger.debug(`Performance timer started: ${label}`);
  },

  end: (label) => {
    if (!performance.marks[label]) {
      logger.warn(`Performance timer "${label}" not found`);
      return null;
    }
    const duration = Date.now() - performance.marks[label];
    logger.debug(`Performance timer ended: ${label} (${duration}ms)`);
    delete performance.marks[label];
    return duration;
  },
};

export default logger;
