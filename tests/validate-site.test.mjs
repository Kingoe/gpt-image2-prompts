import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { validateSite } from "../scripts/validate-site.mjs";

test("validateSite accepts the static site contract", async () => {
  const root = await createSiteFixture();

  const result = await validateSite(root);

  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
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

  await writeFile(
    path.join(root, "site", "index.html"),
    [
      '<div id="featured-list"></div>',
      '<div id="prompt-grid"></div>',
      '<dialog id="prompt-dialog"></dialog>',
      '<input id="search-input" />',
    ].join("\n"),
  );
  await writeFile(path.join(root, "site", "styles.css"), "body {}\n");
  await writeFile(path.join(root, "site", "favicon.svg"), "<svg></svg>\n");
  await writeFile(
    path.join(root, "site", "app.js"),
    [
      "fetch('../site-data/prompts.json')",
      "fetch('../site-data/scenes.json')",
      "fetch('../site-data/tags.json')",
      "fetch('../site-data/summary.json')",
    ].join("\n"),
  );
  await writeFile(path.join(root, "site", "README.md"), "# Site\n");

  for (const fileName of ["prompts.json", "scenes.json", "tags.json", "summary.json"]) {
    await writeFile(path.join(root, "site-data", fileName), "{}\n");
  }

  return root;
}
