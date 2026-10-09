module.exports = {
  projects: [
    { displayName: 'unit', testEnvironment: 'node', testMatch: ['<rootDir>/tests/unit/**/*.test.js'] },
    { displayName: 'integration', testEnvironment: 'node', testMatch: ['<rootDir>/tests/integration/**/*.test.js'] },
  ],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/docs/**'],
  coverageReporters: ['text-summary', 'text', 'lcov'],
  coverageThreshold: { global: { statements: 80, branches: 80, functions: 80, lines: 80 } },
};
