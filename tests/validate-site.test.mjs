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
    siteUrl: "https://kingoecode.com",
  });

  assert.equal(result.basePath, "/prompt-atlas/");
  assert.equal(result.siteUrl, "https://kingoecode.com");

  const index = await readFile(path.join(root, "dist", "index.html"), "utf8");
  const manifest = JSON.parse(
    await readFile(path.join(root, "dist", "deploy-manifest.json"), "utf8"),
  );

  assert.match(index, /\/prompt-atlas\/site-data/);
  assert.doesNotMatch(index, /GitHub README/);
  assert.match(index, /repositoryUrl/);
  assert.match(index, /rel="canonical" href="https:\/\/kingoecode\.com\/prompt-atlas\/"/);
  assert.match(
    index,
    /property="og:image" content="https:\/\/kingoecode\.com\/prompt-atlas\/assets\/previews\/cinematic-character-poster-generated\.png"/,
  );
  const scenePage = await readFile(
    path.join(root, "dist", "scenes", "example-scene", "index.html"),
    "utf8",
  );
  const tagPage = await readFile(path.join(root, "dist", "tags", "信息图", "index.html"), "utf8");
  assert.match(scenePage, /Example Scene - Prompt Atlas/);
  assert.match(scenePage, /"initialScene": "example-scene"/);
  assert.match(tagPage, /信息图 提示词 - Prompt Atlas/);
  assert.match(tagPage, /"initialTag": "信息图"/);
  assert.equal(manifest.base_path, "/prompt-atlas/");
  assert.equal(manifest.site_url, "https://kingoecode.com/prompt-atlas/");
  assert.deepEqual(manifest.generated_pages, ["scenes/", "tags/"]);
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
      '<title>GPT Image 2 Prompt Atlas</title>',
      '<meta name="description" content="一个可搜索、可预览、可复制的 GPT Image 2 提示词图鉴。" />',
      '<meta property="og:title" content="GPT Image 2 Prompt Atlas" />',
      '<meta property="og:description" content="先看效果，再拿走提示词。" />',
      '<a href="#featured">精选</a>',
      '<a href="#browse">浏览</a>',
      '<a href="https://github.com/Kingoe/gpt-image2-prompts/issues/new/choose">投稿提示词</a>',
      '<link rel="canonical" href="https://kingoecode.com/prompt-atlas/" />',
      '<meta property="og:image" content="https://kingoecode.com/prompt-atlas/assets/previews/cinematic-character-poster-generated.png" />',
      '<meta name="twitter:card" content="summary_large_image" />',
      '<meta name="twitter:title" content="GPT Image 2 Prompt Atlas" />',
      '<meta name="twitter:description" content="先看效果，再拿走提示词。" />',
      '<meta name="twitter:image" content="https://kingoecode.com/prompt-atlas/assets/previews/cinematic-character-poster-generated.png" />',
      '<link rel="icon" href="./favicon.svg" />',
      '<link rel="stylesheet" href="./styles.css" />',
      '<div id="featured-list"></div>',
      '<div id="prompt-grid"></div>',
      '<dialog id="prompt-dialog"></dialog>',
      '<input id="search-input" />',
      '<button id="copy-link" type="button">复制链接</button>',
      '<footer id="about">Source & Rights</footer>',
      "<script>window.PROMPT_ATLAS_CONFIG = { assetBase: '..', dataBase: '../site-data', linkBase: '..', repositoryUrl: 'https://github.com/Kingoe/gpt-image2-prompts', initialScene: '', initialTag: '', staticPages: false };</script>",
      '<script src="./app.js"></script>',
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
      'const params = new URLSearchParams(window.location.search);',
      'params.get("prompt");',
      'params.get("scene");',
      'params.get("tag");',
      "function githubBlobUrl(target) { return config.repositoryUrl + '/blob/main/' + target; }",
      "function listingUrl(type, slug) { return joinUrl(config.linkBase, type + '/' + slug + '/'); }",
      "function bindLocalFilterLinks() {}",
    ].join("\n"),
  );
  await writeFile(path.join(root, "site", "README.md"), "# Site\n");
  await writeFile(
    path.join(root, "scripts", "build-site.mjs"),
    "const base = '/prompt-atlas/'; const env = process.env.SITE_URL;\n",
  );
  await writeFile(path.join(root, "DEPLOY.md"), "# Deploy\n");
  await writeFile(path.join(root, "README.md"), "# README\n");
  await writeFile(path.join(root, "CONTRIBUTING.md"), "# Contributing\n");

  await writeFile(path.join(root, "site-data", "prompts.json"), "[]\n");
  await writeFile(
    path.join(root, "site-data", "scenes.json"),
    `${JSON.stringify([{ slug: "example-scene", name: "Example Scene", count: 2 }], null, 2)}\n`,
  );
  await writeFile(
    path.join(root, "site-data", "tags.json"),
    `${JSON.stringify([{ slug: "信息图", name: "信息图", count: 3 }], null, 2)}\n`,
  );
  await writeFile(path.join(root, "site-data", "summary.json"), "{}\n");

  return root;
}
