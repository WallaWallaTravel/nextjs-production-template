/**
 * Logger Tests
 */

import { logger, logError, logApiRequest, logDbError } from '@/lib/logger';

describe('Logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log levels', () => {
    it('logs info messages', () => {
      logger.info('Test info message');

      expect(consoleSpy.log).toHaveBeenCalled();
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('INFO');
      expect(output).toContain('Test info message');
    });

    it('logs warn messages', () => {
      logger.warn('Test warning');

      expect(consoleSpy.warn).toHaveBeenCalled();
      const output = consoleSpy.warn.mock.calls[0][0];
      expect(output).toContain('WARN');
    });

    it('logs error messages', () => {
      logger.error('Test error');

      expect(consoleSpy.error).toHaveBeenCalled();
      const output = consoleSpy.error.mock.calls[0][0];
      expect(output).toContain('ERROR');
    });
  });

  describe('context handling', () => {
    it('includes context in log output', () => {
      logger.info('User action', { userId: 123, action: 'login' });

      expect(consoleSpy.log).toHaveBeenCalled();
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('userId');
      expect(output).toContain('123');
    });

    it('formats errors specially', () => {
      const error = new Error('Something went wrong');
      logger.error('Operation failed', { error });

      expect(consoleSpy.error).toHaveBeenCalled();
      const output = consoleSpy.error.mock.calls[0][0];
      expect(output).toContain('Something went wrong');
    });
  });

  describe('child logger', () => {
    it('creates child with preset context', () => {
      const childLogger = logger.child({ module: 'auth' });
      childLogger.info('User logged in');

      expect(consoleSpy.log).toHaveBeenCalled();
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('module');
      expect(output).toContain('auth');
    });

    it('merges additional context with preset', () => {
      const childLogger = logger.child({ module: 'auth' });
      childLogger.info('Action', { userId: 456 });

      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('module');
      expect(output).toContain('userId');
    });
  });

  describe('helper functions', () => {
    it('logError returns error ID', () => {
      const errorId = logError('TestModule', 'Test error');

      expect(errorId).toMatch(/^ERR-/);
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('logApiRequest logs request info', () => {
      logApiRequest('POST', '/api/users', 'user-123');

      expect(consoleSpy.log).toHaveBeenCalled();
      const output = consoleSpy.log.mock.calls[0][0];
      expect(output).toContain('POST');
      expect(output).toContain('/api/users');
    });

    it('logDbError logs database errors', () => {
      const error = new Error('Connection failed');
      logDbError('insert', error, { table: 'users' });

      expect(consoleSpy.error).toHaveBeenCalled();
      const output = consoleSpy.error.mock.calls[0][0];
      expect(output).toContain('Database error');
      expect(output).toContain('insert');
    });
  });

  describe('time helper', () => {
    it('times async operations', async () => {
      const result = await logger.time(
        'Async operation',
        async () => {
          return 'result';
        }
      );

      expect(result).toBe('result');
      // Debug logs timing
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('logs errors from failed operations', async () => {
      await expect(
        logger.time('Failing operation', async () => {
          throw new Error('Failed');
        })
      ).rejects.toThrow('Failed');

      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });
});
