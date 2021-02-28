const testFolderPath = (folderName) =>
  `<rootDir>/test/${folderName}/**/*.ts(x)`;

const NORMAL_TEST_FOLDERS = ['hooks'];

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  displayName: 'React',
  testMatch: NORMAL_TEST_FOLDERS.map(testFolderPath),
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
