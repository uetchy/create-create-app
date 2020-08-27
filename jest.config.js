module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/src/__tests__/*.+(ts|tsx|js)', '**/tests/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/lib/'],
};
