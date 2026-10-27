import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import { defineConfig, globalIgnores } from "eslint/config";

const webFiles = ["apps/web/**/*.{js,jsx,mjs,ts,tsx,mts}"];
const nodeFiles = ["apps/api/**/*.ts", "packages/shared/**/*.ts"];

const scope = (configs, files) =>
  configs.map((config) => ({ ...config, files }));

export default defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "apps/web/next-env.d.ts",
    "apps/api/src/generated/**",
  ]),
  ...scope(nextVitals, webFiles),
  ...scope(nextTs, webFiles),
  {
    files: webFiles,
    settings: {
      next: { rootDir: "apps/web" },
      react: { version: "19.3" },
    },
  },
  {
    files: nodeFiles,
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  prettier,
]);
