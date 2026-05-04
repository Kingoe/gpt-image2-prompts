import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_BASE_PATH = "/prompt-atlas/";
const DEFAULT_DIST_DIR = "dist";

export async function buildSite({
  rootDir = process.cwd(),
  basePath = process.env.BASE_PATH ?? DEFAULT_BASE_PATH,
  distDir = process.env.DIST_DIR ?? DEFAULT_DIST_DIR,
} = {}) {
  const normalizedBasePath = normalizeBasePath(basePath);
  const distPath = path.resolve(rootDir, distDir);

  assertInsideRoot(rootDir, distPath);

  await rm(distPath, { recursive: true, force: true });
  await mkdir(distPath, { recursive: true });

  await copyDirectory(path.join(rootDir, "assets"), path.join(distPath, "assets"));
  await copyDirectory(path.join(rootDir, "site-data"), path.join(distPath, "site-data"));
  await copyDirectory(path.join(rootDir, "library"), path.join(distPath, "library"));
  await copyDirectory(path.join(rootDir, "tags"), path.join(distPath, "tags"));

  await cp(path.join(rootDir, "README.md"), path.join(distPath, "README.md"));
  await cp(path.join(rootDir, "CONTRIBUTING.md"), path.join(distPath, "CONTRIBUTING.md"));
  await cp(path.join(rootDir, "site", "styles.css"), path.join(distPath, "styles.css"));
  await cp(path.join(rootDir, "site", "app.js"), path.join(distPath, "app.js"));
  await cp(path.join(rootDir, "site", "favicon.svg"), path.join(distPath, "favicon.svg"));

  const index = await readFile(path.join(rootDir, "site", "index.html"), "utf8");
  await writeFile(path.join(distPath, "index.html"), transformIndex(index, normalizedBasePath));
  await writeFile(
    path.join(distPath, "deploy-manifest.json"),
    `${JSON.stringify(
      {
        base_path: normalizedBasePath,
        generated_from: "site/",
        content_source: "library/",
      },
      null,
      2,
    )}\n`,
  );

  return {
    distPath,
    basePath: normalizedBasePath,
  };
}

function transformIndex(index, basePath) {
  const baseRoot = basePath.replace(/\/$/g, "");
  const config = {
    assetBase: baseRoot,
    dataBase: `${baseRoot}/site-data`,
    linkBase: baseRoot,
  };

  return index
    .replaceAll('href="../README.md" data-deploy-href="README.md"', `href="${basePath}README.md"`)
    .replaceAll(
      'href="../CONTRIBUTING.md" data-deploy-href="CONTRIBUTING.md"',
      `href="${basePath}CONTRIBUTING.md"`,
    )
    .replace(
      /window\.PROMPT_ATLAS_CONFIG = \{[\s\S]*?\};/,
      `window.PROMPT_ATLAS_CONFIG = ${JSON.stringify(config, null, 8)};`,
    );
}

function normalizeBasePath(value) {
  const trimmed = String(value || "/").trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

async function copyDirectory(source, target) {
  await cp(source, target, { recursive: true });
}

function assertInsideRoot(rootDir, targetPath) {
  const rootPath = path.resolve(rootDir);
  if (!targetPath.startsWith(rootPath)) {
    throw new Error(`Refusing to write outside repository root: ${targetPath}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await buildSite();
  console.log(`Built site at ${path.relative(process.cwd(), result.distPath) || "."}`);
  console.log(`Base path: ${result.basePath}`);
}
