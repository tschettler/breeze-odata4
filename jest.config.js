module.exports = {
    globals: {
        "ts-jest": {
            diagnostics: {
                warnOnly: true
            }
        }
    },
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
    /* moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1'
    }, */
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