/**
 * @fileoverview Console-based Logger for Next.js Compatibility
 * @description Provides consistent logging interface without Winston dependencies
 * @version 2.0.0 
 * @created 2025-10-06
 *
 * OVERVIEW:
 * Simple console-based logging system that works seamlessly in Next.js 
 * client and server environments without module resolution conflicts.
 *
 * Responsibilities:
 * - Provide consistent logging interface (info, warn, error, debug, verbose)
 * - Work in both browser and Node.js environments
 * - Maintain security by redacting sensitive information
 * - Format output with timestamps and structured data
 * - Replace Winston without breaking existing API
 *
 * Security:
 * - Redacts known sensitive keys when passed directly as objects
 * - Safe for both client and server-side usage
 */

/**
 * GLOBAL ERROR HANDLING (ECHO v5):
 * Registers process-level handlers for uncaught exceptions and unhandled promise rejections.
 * Uses console.error as fallback to avoid circular dependencies.
 */
declare global {
  // eslint-disable-next-line no-var
  var __AGGRO_LOGGER_HANDLERS_INSTALLED__: boolean | undefined;
}

if (typeof process !== 'undefined' && process.on && !globalThis.__AGGRO_LOGGER_HANDLERS_INSTALLED__) {
  globalThis.__AGGRO_LOGGER_HANDLERS_INSTALLED__ = true;
  process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', {
      message: err?.message,
      stack: err?.stack,
      code: (err as any)?.code,
      timestamp: new Date().toISOString()
    });
    // Optionally: process.exit(1); // Only if you want to crash on fatal
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Promise Rejection:', {
      reason,
      timestamp: new Date().toISOString()
    });
    // Optionally: process.exit(1);
  });
}

// Types
interface RedactableObject { [key: string]: any }

// Security configuration
const SENSITIVE_KEYS = ['password', 'passwd', 'secret', 'token', 'apiKey', 'authorization', 'auth'];

/**
 * Redacts sensitive information from objects
 * @param value - The value to redact
 * @returns Redacted copy of the value
 */
function redact(value: any): any {
  if (!value || typeof value !== 'object') return value;
  const clone: RedactableObject = Array.isArray(value) ? [] : {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk))) {
      clone[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      clone[k] = redact(v);
    } else {
      clone[k] = v;
    }
  }
  return clone;
}

/**
 * Get formatted timestamp for logging
 * @returns ISO timestamp string
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format log message with timestamp and metadata
 * @param level - Log level
 * @param message - Log message
 * @param meta - Optional metadata
 * @returns Formatted log arguments
 */
function formatLogMessage(level: string, message: string, meta?: any): [string, any?] {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
  
  if (meta && typeof meta === 'object' && Object.keys(meta).length > 0) {
    return [`${prefix} ${message}`, redact(meta)];
  }
  
  return [`${prefix} ${message}`];
}

/**
 * Console-based logger implementation
 * Maintains the same API as Winston logger for drop-in replacement
 */
const logger = {
  info: (message: string, meta?: any) => {
    const args = formatLogMessage('info', message, meta);
    console.info(...args);
  },
  
  warn: (message: string, meta?: any) => {
    const args = formatLogMessage('warn', message, meta);
    console.warn(...args);
  },
  
  error: (message: string, meta?: any) => {
    const args = formatLogMessage('error', message, meta);
    console.error(...args);
  },
  
  debug: (message: string, meta?: any) => {
    // Only log debug in development or when LOG_LEVEL includes debug
    const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    if (process.env.NODE_ENV === 'development' || logLevel === 'debug' || logLevel === 'verbose') {
      const args = formatLogMessage('debug', message, meta);
      console.debug(...args);
    }
  },
  
  verbose: (message: string, meta?: any) => {
    // Only log verbose in development or when LOG_LEVEL includes verbose
    const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    if (process.env.NODE_ENV === 'development' || logLevel === 'verbose') {
      const args = formatLogMessage('verbose', message, meta);
      console.log(...args);
    }
  }
};

/**
 * Enhanced logging interface with error handling
 * Provides the same API as the previous Winston-based logger
 */
export const log = {
  info: (msg: string, meta?: any) => logger.info(msg, meta),
  warn: (msg: string, meta?: any) => logger.warn(msg, meta),
  error: (msg: string, err?: any) => {
    if (err instanceof Error) {
      logger.error(msg, { message: err.message, stack: err.stack });
    } else if (err) {
      logger.error(msg, redact(err));
    } else {
      logger.error(msg);
    }
  },
  debug: (msg: string, meta?: any) => logger.debug(msg, meta),
  verbose: (msg: string, meta?: any) => logger.verbose(msg, meta),
};

// Default export for compatibility
export default logger;

/*
 * File: /src/lib/logger.ts
 * Created: 2025-09-27
 * Modified: 2025-10-06 08:15:00
 * 
 * Dependencies:
 * - None (uses native console API)
 * - Works in both browser and Node.js environments
 * 
 * Exports:
 * - log: Enhanced logging interface with error handling
 * - default: Console-based logger compatible with Winston API
 * 
 * Changes in v2.0.0:
 * - Removed Winston dependency to fix Next.js module resolution conflicts
 * - Replaced with console-based logging that works in all environments
 * - Maintained same API for backward compatibility
 * - Added structured logging with timestamps
 * - Kept sensitive data redaction for security
 */