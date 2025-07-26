import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock console methods before importing the logger
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

vi.stubGlobal('console', mockConsole);

describe('Logger Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variable
    vi.stubEnv('NODE_ENV', 'test');
  });

  it('should import logger module without errors', async () => {
    const loggerModule = await import('../../utils/logger');
    expect(loggerModule).toBeDefined();
  });

  it('should export a logger object', async () => {
    const { logger } = await import('../../utils/logger');
    expect(logger).toBeDefined();
    expect(typeof logger).toBe('object');
  });

  it('should have logging methods', async () => {
    const { logger } = await import('../../utils/logger');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should log info messages', async () => {
    const { logger } = await import('../../utils/logger');
    logger.info('Test info message');
    expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('Test info message'));
  });

  it('should log error messages', async () => {
    const { logger } = await import('../../utils/logger');
    logger.error('Test error message');
    expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Test error message'));
  });

  it('should log warning messages', async () => {
    const { logger } = await import('../../utils/logger');
    logger.warn('Test warning message');
    expect(mockConsole.warn).toHaveBeenCalledWith(expect.stringContaining('Test warning message'));
  });

  it('should log debug messages', async () => {
    const { logger } = await import('../../utils/logger');
    logger.debug('Test debug message');
    expect(mockConsole.debug).toHaveBeenCalledWith(expect.stringContaining('Test debug message'));
  });

  it('should handle error objects', async () => {
    const { logger } = await import('../../utils/logger');
    const testError = new Error('Test error object');
    logger.error('Error occurred:', testError);
    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should handle multiple arguments', async () => {
    const { logger } = await import('../../utils/logger');
    logger.info('Multiple', 'arguments', 'test');
    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should work in different environments', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    
    // Re-import to get fresh module state
    delete require.cache[require.resolve('../../utils/logger')];
    const { logger } = await import('../../utils/logger');
    
    logger.info('Production test');
    expect(mockConsole.info).toHaveBeenCalled();
  });
});
