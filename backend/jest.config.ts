module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/__tests__/setup.ts"],
};




//@type {import('ts-jest').JestConfigWithTsJest}
//module.exports = {
//  preset: "ts-jest",
//  testEnvironment: "node",
//  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
//  testMatch: ["**/__tests__/**/*.test.ts"]
//};
