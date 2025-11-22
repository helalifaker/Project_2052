import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "VariableDeclarator[id.name=/.*(Price|Cost|Revenue|Profit|Income|Tax|Salary|Rent|Amount|Balance|Budget|Forecast|Scenarios).*/] > Literal[value=/^[0-9]+(\\.[0-9]+)?$/]",
          message: "Do not use plain numbers for financial values. Use Decimal.js instead.",
        },
        {
          selector: "TSNumberKeyword",
          message: "Avoid 'number' type for financial calculations. Use 'Decimal' from 'decimal.js'.",
        }
      ],
    },
  }
]);

export default eslintConfig;
