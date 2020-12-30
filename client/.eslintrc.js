module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/recommended",
        "plugin:prettier/recommended",
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",
    },
    plugins: ["react", "react-hooks", "prettier", "@typescript-eslint", "jest"],
    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        "prettier/prettier": "warn",

        "@typescript-eslint/no-use-before-define": "off",

        "jest/expect-expect": [
            "error",
            {
                assertFunctionNames: ["expect", "expectoPatronum", "td.verify"],
            },
        ],

        "react/prop-types": "off",
    },
    overrides: [
        {
            files: ["*.js", "*.jsx"],
            excludedFiles: ["*.ts", "*.tsx"],
            rules: {
                "@typescript-eslint/no-var-requires": "off",
            },
        },
        {
            files: ["src/__tests__/**", "**/*.js", "**/*.jsx"],
            rules: {
                "@typescript-eslint/explicit-function-return-type": "off",
                "react/display-name": "off",
            },
        },
    ],
};
