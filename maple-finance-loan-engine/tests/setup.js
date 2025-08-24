// Test setup file
console.log('Setting up Maple Finance test environment...');

// Global test timeout - increased for model training
jest.setTimeout(120000);

// Mock console.log for cleaner test output
global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error // Keep error logs for debugging
};
