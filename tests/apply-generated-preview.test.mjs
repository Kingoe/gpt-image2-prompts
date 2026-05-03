import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { applyGeneratedPreview } from "../scripts/apply-generated-preview.mjs";

test("applyGeneratedPreview updates existing preview metadata and image", async () => {
  const root = await createTempRepo();
  const cardPath = path.join("library", "social-media-post", "sample.md");
  const imagePath = path.join("assets", "previews", "sample-generated.png");

  await writeFile(
    path.join(root, cardPath),
    [
      "---",
      "title: Sample Card",
      "cover: ../../assets/covers/example.svg",
      "preview: ../../assets/previews/sample-preview.svg",
      "preview_type: placeholder",
      "preview_source: placeholder preview, replace with generated image when available",
      "scene: 社媒贴文",
      "tags:",
      "  - 信息卡片",
      "prompt: Make a polished social media poster.",
      "summary: A reusable poster prompt.",
      "source: self-curated",
      "collected_at: 2026-05-03",
      "---",
      "",
      "# Sample Card",
      "",
      "## 效果预览",
      "",
      "![旧预览](../../assets/previews/sample-preview.svg)",
      "",
      "## 提示词",
    ].join("\n"),
  );

  await applyGeneratedPreview({ rootDir: root, cardPath, imagePath });

  const updated = await readFile(path.join(root, cardPath), "utf8");
  assert.match(updated, /preview: \.\.\/\.\.\/assets\/previews\/sample-generated\.png/);
  assert.match(updated, /preview_type: generated/);
  assert.match(updated, /preview_source: generated from this prompt/);
  assert.match(
    updated,
    /!\[Sample Card预览\]\(\.\.\/\.\.\/assets\/previews\/sample-generated\.png\)/,
  );
});

test("applyGeneratedPreview inserts an effect preview section when missing", async () => {
  const root = await createTempRepo();
  const cardPath = path.join("library", "product-showcase", "sample.md");
  const imagePath = path.join("assets", "previews", "product-generated.png");

  await mkdir(path.join(root, "library", "product-showcase"), { recursive: true });
  await writeFile(
    path.join(root, cardPath),
    [
      "---",
      "title: Product Card",
      "cover: ../../assets/covers/example.svg",
      "scene: 产品展示图",
      "tags:",
      "  - 3D 渲染",
      "prompt: Make a premium product render.",
      "summary: A reusable product prompt.",
      "source: self-curated",
      "collected_at: 2026-05-03",
      "---",
      "",
      "# Product Card",
      "",
      "## 提示词",
    ].join("\n"),
  );

  await applyGeneratedPreview({ rootDir: root, cardPath, imagePath });

  const updated = await readFile(path.join(root, cardPath), "utf8");
  assert.match(updated, /preview: \.\.\/\.\.\/assets\/previews\/product-generated\.png/);
  assert.match(updated, /## 效果预览\n\n!\[Product Card预览\]/);
});

test("applyGeneratedPreview rejects a missing generated image", async () => {
  const root = await createTempRepo();
  const cardPath = path.join("library", "social-media-post", "sample.md");

  await writeFile(
    path.join(root, cardPath),
    [
      "---",
      "title: Sample Card",
      "cover: ../../assets/covers/example.svg",
      "scene: 社媒贴文",
      "tags:",
      "  - 信息卡片",
      "prompt: Make a polished social media poster.",
      "summary: A reusable poster prompt.",
      "source: self-curated",
      "collected_at: 2026-05-03",
      "---",
      "",
      "# Sample Card",
    ].join("\n"),
  );

  await assert.rejects(
    () =>
      applyGeneratedPreview({
        rootDir: root,
        cardPath,
        imagePath: path.join("assets", "previews", "missing.png"),
      }),
    /Preview image does not exist/,
  );
});

async function createTempRepo() {
  const root = await mkdtemp(path.join(tmpdir(), "preview-apply-"));
  await mkdir(path.join(root, "library", "social-media-post"), { recursive: true });
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "assets", "previews"), { recursive: true });
  await writeFile(path.join(root, "assets", "previews", "sample-generated.png"), "png\n");
  await writeFile(path.join(root, "assets", "previews", "product-generated.png"), "png\n");
  return root;
}
