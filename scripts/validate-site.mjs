import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const REQUIRED_SITE_FILES = [
  path.join("site", "index.html"),
  path.join("site", "styles.css"),
  path.join("site", "app.js"),
  path.join("site", "favicon.svg"),
  path.join("site", "README.md"),
];

const REQUIRED_BUILD_FILES = [
  path.join("scripts", "build-site.mjs"),
  "DEPLOY.md",
];

const REQUIRED_DATA_FILES = [
  path.join("site-data", "prompts.json"),
  path.join("site-data", "scenes.json"),
  path.join("site-data", "tags.json"),
  path.join("site-data", "summary.json"),
];

export async function validateSite(rootDir = process.cwd()) {
  const errors = [];

  for (const filePath of [...REQUIRED_SITE_FILES, ...REQUIRED_DATA_FILES, ...REQUIRED_BUILD_FILES]) {
    if (!(await exists(path.join(rootDir, filePath)))) {
      errors.push(`Missing file: ${filePath}`);
    }
  }

  const index = await readOptional(path.join(rootDir, "site", "index.html"));
  const app = await readOptional(path.join(rootDir, "site", "app.js"));
  const buildScript = await readOptional(path.join(rootDir, "scripts", "build-site.mjs"));

  for (const dataFile of REQUIRED_DATA_FILES) {
    const relativeDataPath = `../${dataFile.split(path.sep).join("/")}`;
    const dataFileName = path.basename(dataFile);
    if (!app.includes(dataFileName)) {
      errors.push(`site/app.js does not load ${relativeDataPath}`);
    }
  }

  if (!buildScript.includes("/prompt-atlas/")) {
    errors.push("scripts/build-site.mjs should default to /prompt-atlas/");
  }

  if (!buildScript.includes("SITE_URL")) {
    errors.push("scripts/build-site.mjs should support SITE_URL for canonical share links");
  }

  for (const selector of ["featured-list", "prompt-grid", "prompt-dialog", "search-input", "copy-link", "about"]) {
    if (!index.includes(`id="${selector}"`)) {
      errors.push(`site/index.html is missing #${selector}`);
    }
  }

  for (const token of ['rel="canonical"', 'property="og:image"', 'name="twitter:card"']) {
    if (!index.includes(token)) {
      errors.push(`site/index.html is missing ${token}`);
    }
  }

  if (index.includes("GitHub README")) {
    errors.push("site/index.html should not show GitHub README in the primary navigation");
  }

  for (const token of ["URLSearchParams", '"prompt"', '"scene"', '"tag"', "githubBlobUrl", "listingUrl"]) {
    if (!app.includes(token)) {
      errors.push(`site/app.js is missing URL state support for ${token}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readOptional(targetPath) {
  try {
    return await readFile(targetPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await validateSite(process.cwd());

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Site validation passed.");
  }
}
