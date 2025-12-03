import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    plugins: ["prettier"],
  }),
  {
    rules: {
      // Prettier integration
      "prettier/prettier": "error",

      // Import rules
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true
          }
        }
      ],

      // React rules
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error"
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.config.js",
      "**/*.config.mjs"
    ],
  },
];

export default eslintConfig;
