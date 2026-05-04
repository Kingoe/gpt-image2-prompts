import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  buildSiteData,
  checkSiteData,
  writeSiteData,
} from "../scripts/export-site-data.mjs";

test("buildSiteData exports prompts, scenes, tags and featured flags", async () => {
  const root = await createFixtureRepo();

  const data = await buildSiteData(root);

  assert.equal(data.totals.prompts, 2);
  assert.equal(data.totals.scenes, 2);
  assert.equal(data.totals.tags, 2);
  assert.equal(data.totals.generated_previews, 2);
  assert.equal(data.totals.polished, 2);
  assert.equal(data.totals.featured, 1);

  assert.equal(data.prompts[0].id, "poster-cover/sample-poster");
  assert.equal(data.prompts[0].featured, true);
  assert.equal(data.prompts[0].prompt, "第一行提示词\n第二行提示词");
  assert.equal(data.prompts[0].preview, "assets/previews/sample-preview.png");

  assert.deepEqual(data.scenes.map((scene) => scene.slug), [
    "poster-cover",
    "social-avatar",
  ]);
  assert.equal(data.tags[0].name, "电影海报感");
  assert.deepEqual(data.tags[0].prompts, [
    "poster-cover/sample-poster",
    "social-avatar/sample-avatar",
  ]);
});

test("writeSiteData writes stable JSON and checkSiteData detects drift", async () => {
  const root = await createFixtureRepo();

  await writeSiteData(root);
  const check = await checkSiteData(root);
  assert.equal(check.ok, true);

  const promptsPath = path.join(root, "site-data", "prompts.json");
  const prompts = JSON.parse(await readFile(promptsPath, "utf8"));
  prompts[0].title = "Changed";
  await writeFile(promptsPath, `${JSON.stringify(prompts, null, 2)}\n`);

  const drift = await checkSiteData(root);
  assert.equal(drift.ok, false);
  assert.deepEqual(drift.mismatches, ["site-data/prompts.json"]);
});

async function createFixtureRepo() {
  const root = await mkdtemp(path.join(tmpdir(), "site-data-fixture-"));
  await mkdir(path.join(root, "library", "poster-cover"), { recursive: true });
  await mkdir(path.join(root, "library", "social-avatar"), { recursive: true });
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "assets", "previews"), { recursive: true });

  await writeFile(
    path.join(root, "README.md"),
    "| 预览 | 标题 |\n| --- | --- |\n| x | [海报](library/poster-cover/sample-poster.md) |\n",
  );
  await writeFile(path.join(root, "assets", "covers", "sample.svg"), "<svg></svg>\n");
  await writeFile(
    path.join(root, "assets", "previews", "sample-preview.png"),
    "fake image\n",
  );
  await writeCard({
    root,
    sceneSlug: "poster-cover",
    fileName: "sample-poster.md",
    title: "样例海报",
    scene: "海报封面",
    tags: ["电影海报感"],
  });
  await writeCard({
    root,
    sceneSlug: "social-avatar",
    fileName: "sample-avatar.md",
    title: "样例头像",
    scene: "社媒头像",
    tags: ["电影海报感", "头像"],
  });

  return root;
}

async function writeCard({ root, sceneSlug, fileName, title, scene, tags }) {
  await writeFile(
    path.join(root, "library", sceneSlug, fileName),
    [
      "---",
      `title: ${title}`,
      "status: polished",
      "cover: ../../assets/covers/sample.svg",
      "preview: ../../assets/previews/sample-preview.png",
      "preview_type: generated",
      "preview_source: generated from this prompt",
      `scene: ${scene}`,
      "tags:",
      ...tags.map((tag) => `  - ${tag}`),
      "prompt: >",
      "  第一行提示词",
      "  第二行提示词",
      `summary: ${title} summary`,
      "source: self-curated",
      "collected_at: 2026-05-04",
      "---",
      "",
      `# ${title}`,
      "",
      "## 提示词",
      "",
      "```text",
      "第一行提示词",
      "第二行提示词",
      "```",
    ].join("\n"),
  );
}
