module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/app/$1',
    '^@features/(.*)$': '<rootDir>/features/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@providers/(.*)$': '<rootDir>/providers/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/web-build/**',
    '!**/.expo/**',
    '!**/coverage/**',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/web-build/',
    '/.expo/',
    '/coverage/',
  ],
  testEnvironment: 'node',
};
