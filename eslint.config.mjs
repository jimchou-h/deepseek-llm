import { dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// next@14.1 的 `next lint` 只读 .eslintrc.*；flat 入口委托同一份配置，避免双轨漂移。
const eslintrc = JSON.parse(readFileSync(new URL(".eslintrc.json", import.meta.url), "utf8"));

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**"] },
  ...compat.config({ ...eslintrc, root: true }),
];

export default eslintConfig;
