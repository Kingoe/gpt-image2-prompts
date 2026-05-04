import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { validateSite } from "../scripts/validate-site.mjs";
import { buildSite } from "../scripts/build-site.mjs";

test("validateSite accepts the static site contract", async () => {
  const root = await createSiteFixture();

  const result = await validateSite(root);

  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test("buildSite creates a prefix-deployable dist directory", async () => {
  const root = await createSiteFixture();

  const result = await buildSite({
    rootDir: root,
    basePath: "/prompt-atlas/",
  });

  assert.equal(result.basePath, "/prompt-atlas/");

  const index = await readFile(path.join(root, "dist", "index.html"), "utf8");
  const manifest = JSON.parse(
    await readFile(path.join(root, "dist", "deploy-manifest.json"), "utf8"),
  );

  assert.match(index, /\/prompt-atlas\/site-data/);
  assert.match(index, /href="\/prompt-atlas\/README\.md"/);
  assert.equal(manifest.base_path, "/prompt-atlas/");
});

test("validateSite reports missing app data wiring", async () => {
  const root = await createSiteFixture();
  await writeFile(path.join(root, "site", "app.js"), "fetch('../site-data/prompts.json')\n");

  const result = await validateSite(root);

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /site-data\/scenes\.json/);
  assert.match(result.errors.join("\n"), /site-data\/tags\.json/);
  assert.match(result.errors.join("\n"), /site-data\/summary\.json/);
});

async function createSiteFixture() {
  const root = await mkdtemp(path.join(tmpdir(), "site-fixture-"));
  await mkdir(path.join(root, "site"), { recursive: true });
  await mkdir(path.join(root, "site-data"), { recursive: true });
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await mkdir(path.join(root, "assets"), { recursive: true });
  await mkdir(path.join(root, "library"), { recursive: true });
  await mkdir(path.join(root, "tags"), { recursive: true });

  await writeFile(
    path.join(root, "site", "index.html"),
    [
      '<a href="../README.md" data-deploy-href="README.md">README</a>',
      '<a href="../CONTRIBUTING.md" data-deploy-href="CONTRIBUTING.md">Contribute</a>',
      '<div id="featured-list"></div>',
      '<div id="prompt-grid"></div>',
      '<dialog id="prompt-dialog"></dialog>',
      '<input id="search-input" />',
      "<script>window.PROMPT_ATLAS_CONFIG = { assetBase: '..', dataBase: '../site-data', linkBase: '..' };</script>",
    ].join("\n"),
  );
  await writeFile(path.join(root, "site", "styles.css"), "body {}\n");
  await writeFile(path.join(root, "site", "favicon.svg"), "<svg></svg>\n");
  await writeFile(
    path.join(root, "site", "app.js"),
    [
      "fetch(joinUrl(config.dataBase, 'prompts.json'))",
      "fetch(joinUrl(config.dataBase, 'scenes.json'))",
      "fetch(joinUrl(config.dataBase, 'tags.json'))",
      "fetch(joinUrl(config.dataBase, 'summary.json'))",
    ].join("\n"),
  );
  await writeFile(path.join(root, "site", "README.md"), "# Site\n");
  await writeFile(path.join(root, "scripts", "build-site.mjs"), "const base = '/prompt-atlas/';\n");
  await writeFile(path.join(root, "DEPLOY.md"), "# Deploy\n");
  await writeFile(path.join(root, "README.md"), "# README\n");
  await writeFile(path.join(root, "CONTRIBUTING.md"), "# Contributing\n");

  for (const fileName of ["prompts.json", "scenes.json", "tags.json", "summary.json"]) {
    await writeFile(path.join(root, "site-data", fileName), "{}\n");
  }

  return root;
}
