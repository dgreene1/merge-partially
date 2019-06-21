module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testEnvironment: "node",
    testRegex: ".*(_spec|.spec).*",
    testPathIgnorePatterns: ["/lib/", "/build/", "/node_modules/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.{ts,tsx}",
        "!**/*_spec*",
        "!**/*aModuleToMock.ts",
        "!**/*.config.*",
        "!**/build/**",
        "!**/coverage",
        "!**/serverless",
        "!**/node_modules/**",
        "!**/vendor/**"
    ]
};