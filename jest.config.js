module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js', '**/test/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  // Downloaded VS Code installations contain unrelated packages named diff/yaml.
  modulePathIgnorePatterns: ['<rootDir>/.vscode-test/'],
  moduleNameMapper: {
    '^vscode$': '<rootDir>/test/vscode-mock.ts',
    '^geodesy/.*$': '<rootDir>/test/geodesy-mock.ts',
    '^d3$': '<rootDir>/test/d3-mock.ts',
    '^flat$': '<rootDir>/test/flat-mock.ts',
    '^@li0ard/streebog$': '<rootDir>/test/streebog-mock.ts',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  transformIgnorePatterns: [
    "<rootDir>/dist/",
    "node_modules/(?!(geodesy)/)"
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/dist/"],
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-report',
      filename: 'index.html',
      expand: true,
    }]
  ]
};
