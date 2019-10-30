module.exports = {
    transform: {
        ".ts": "ts-jest"
    },
    testEnvironment: "node",
    testPathIgnorePatterns: [
        "/dist/", 
        "/node_modules/"
    ],
    moduleFileExtensions: [
        "ts",
        "js",
        "json",
        "node"
    ],
    coveragePathIgnorePatterns: [
        "/dist/",
        "/node_modules/",
        "/tests/",
        "/index.ts"
    ],
    coverageThreshold: {
        global: {
            branches: 65,
            functions: 80,
            lines: 75,
            statements: 75
        }
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.{js,ts}",
        "!**/node_modules/**"
    ]
}