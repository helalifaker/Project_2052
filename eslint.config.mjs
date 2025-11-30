import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Debug/utility scripts
    "scripts/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: [
      "src/lib/**/*.{ts,tsx}",
      "src/app/api/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "VariableDeclarator[id.name=/.*(Price|Cost|Revenue|Profit|Income|Tax|Salary|Rent|Amount|Balance|Budget|Forecast|Scenarios).*/] > Literal[value=/^[0-9]+(\\.[0-9]+)?$/]",
          message:
            "Do not use plain numbers for financial values. Use Decimal.js instead.",
        },
        {
          selector: [
            "TSPropertySignature[key.name=/.*(Price|Cost|Revenue|Profit|Income|Tax|Salary|Rent|Amount|Balance|Budget|Forecast|Scenarios).*/] TSNumberKeyword",
            "Identifier[name=/.*(Price|Cost|Revenue|Profit|Income|Tax|Salary|Rent|Amount|Balance|Budget|Forecast|Scenarios).*/] > TSTypeAnnotation > TSNumberKeyword",
            "TSParameterProperty > Identifier[name=/.*(Price|Cost|Revenue|Profit|Income|Tax|Salary|Rent|Amount|Balance|Budget|Forecast|Scenarios).*/] > TSTypeAnnotation > TSNumberKeyword",
          ].join(", "),
          message:
            "Avoid 'number' type for financial calculations. Use 'Decimal' from 'decimal.js'.",
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: [
      "tests/**/*.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "src/lib/engine/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["src/components/proposals/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
