module.exports = {
    transform: {
        '.ts': 'ts-jest'
    },
    testEnvironment: 'node',
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|js)$',
    testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
    ],
    /*     moduleNameMapper: {
            //"^breeze-client$": "<rootDir>/typings/breeze-client/index.d.ts"
        },
        modulePaths: [
            "<rootDir>/typings/breeze-client"
        ],
        modulePathIgnorePatterns: [
            "<rootDir>/node_modules/breeze-client",
        ],
    */
    moduleFileExtensions: [
        'ts',
        'js'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0
        }
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,ts}'
    ]
}