import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

function writeProdHtml() {
  return {
    name: "write-prod-html",
    // closeBundle runs once even with multiple outputs (avoids copy/unlink races on CI).
    closeBundle() {
      const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Digitizer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="./styles/tokens.css" />
  </head>
  <body>
    <div class="atmosphere" aria-hidden="true"></div>
    <digitizer-app></digitizer-app>
    <script type="module" src="./digitizer-modules.js"></script>
  </body>
</html>
`;
      mkdirSync(join(__dirname, "dist"), { recursive: true });
      writeFileSync(join(__dirname, "dist/index.html"), html);
    },
  };
}

/** @type {import('rollup').RollupOptions} */
export default {
  input: ".build/main.js",
  // TypeScript decorator helpers reference `this` at module top-level.
  context: "globalThis",
  moduleContext: () => "globalThis",
  output: [
    {
      file: "dist/digitizer-modules.js",
      format: "es",
      sourcemap: true,
      banner: `/*! ${pkg.name}@${pkg.version} */`,
    },
    {
      file: "dist/digitizer-modules.iife.js",
      format: "iife",
      name: "DigitizerModules",
      sourcemap: true,
      banner: `/*! ${pkg.name}@${pkg.version} */`,
    },
  ],
  plugins: [
    resolve({ browser: true }),
    // Lit decorators already emitted by tsc (experimentalDecorators).
    // Babel only downlevels for browser targets — no decorator plugins.
    babel({
      babelHelpers: "bundled",
      babelrc: false,
      configFile: join(__dirname, "babel.config.json"),
      extensions: [".js"],
      exclude: "node_modules/**",
    }),
    terser({
      format: { comments: /^!/ },
    }),
    copy({
      targets: [
        { src: "src/styles/tokens.css", dest: "dist/styles" },
        { src: "public/favicon.svg", dest: "dist" },
      ],
      hook: "closeBundle",
      copyOnce: true,
    }),
    writeProdHtml(),
  ],
};
