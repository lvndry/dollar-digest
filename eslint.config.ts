import type { Linter } from "eslint";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig: Linter.Config[] = [
  ...coreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "no-console": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["scripts/**/*.{ts,js}"],
    rules: { "no-console": "off" },
  },
];

export default eslintConfig;
