module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/client'],
  testMatch: ['**/*.test.js', '**/*.spec.js'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/**/*.test.js',
    '!server/config/**',
    '!server/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@server/(.*)$': '<rootDir>/server/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
  modulePaths: ['<rootDir>/server']
};