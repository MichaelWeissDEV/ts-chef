module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js', '**/test/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  transformIgnorePatterns: [
    "node_modules/(?!(geodesy)/)"
  ],
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-report',
      filename: 'index.html',
      expand: true,
    }]
  ]
};
