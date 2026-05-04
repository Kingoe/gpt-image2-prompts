import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { validateRepo } from "../scripts/validate-repo.mjs";

test("validateRepo accepts a complete prompt-library repository", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prompt-repo-pass-"));

  await mkdir(path.join(root, "inbox"), { recursive: true });
  await mkdir(path.join(root, "tags"), { recursive: true });
  await mkdir(path.join(root, "templates"), { recursive: true });
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "assets", "previews"), { recursive: true });
  for (const scene of [
    "product-showcase",
    "social-avatar",
    "poster-cover",
    "explainer-visual",
  ]) {
    await mkdir(path.join(root, "library", scene), { recursive: true });
  }

  await writeFile(
    path.join(root, "README.md"),
    [
      "# GPT Image 2 Prompt Library",
      "## 精选提示词",
      "## 按使用场景浏览",
      "## 热门效果标签",
      "## 最近新增",
      "## 如何使用",
    ].join("\n\n"),
  );

  await writeFile(path.join(root, "inbox", "README.md"), "# Inbox\n");
  await writeFile(path.join(root, "tags", "README.md"), "# Tags\n");
  await writeFile(path.join(root, "templates", "prompt-card.md"), "# Template\n");
  await writeFile(
    path.join(root, "assets", "previews", "example-preview.svg"),
    "<svg></svg>\n",
  );

  const sceneMap = [
    "product-showcase",
    "product-showcase",
    "product-showcase",
    "social-avatar",
    "social-avatar",
    "social-avatar",
    "poster-cover",
    "poster-cover",
    "poster-cover",
    "explainer-visual",
    "explainer-visual",
    "explainer-visual",
  ];
  for (const [index, scene] of sceneMap.entries()) {
    await writeFile(
      path.join(root, "library", scene, `sample-${index + 1}.md`),
      [
        "---",
        `title: Example Card ${index + 1}`,
        "status: polished",
        "cover: ../../assets/covers/example.svg",
        "preview: ../../assets/previews/example-preview.svg",
        "preview_type: generated",
        "preview_source: generated from this prompt",
        "scene: 产品展示图",
        "tags:",
        "  - 爆炸视图",
        "prompt: Build a premium exploded-view device shot.",
        "summary: A reusable prompt card for product hero visuals.",
        "source: https://example.com/source",
        "collected_at: 2026-05-02",
        "---",
        "",
        `# Example Card ${index + 1}`,
        "",
        "## 变量说明",
        "",
        "- Replace the subject.",
        "",
        "## 生成注意事项",
        "",
        "- Check generated text.",
      ].join("\n"),
    );
  }

  const result = await validateRepo(root);

  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test("validateRepo reports missing required sections and metadata", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prompt-repo-fail-"));

  await mkdir(path.join(root, "library", "avatar"), { recursive: true });
  await writeFile(path.join(root, "README.md"), "# Missing Sections\n");
  await writeFile(
    path.join(root, "library", "avatar", "broken.md"),
    [
      "---",
      "title: Broken Card",
      "scene: 社媒头像",
      "---",
      "",
      "# Broken Card",
    ].join("\n"),
  );

  const result = await validateRepo(root);

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /README\.md is missing section: 精选提示词/);
  assert.match(result.errors.join("\n"), /Missing directory: inbox/);
  assert.match(result.errors.join("\n"), /broken\.md is missing frontmatter field: status/);
  assert.match(result.errors.join("\n"), /broken\.md is missing frontmatter field: cover/);
  assert.match(result.errors.join("\n"), /broken\.md is missing frontmatter field: prompt/);
});

test("validateRepo enforces launch-ready category and card counts", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prompt-repo-counts-"));

  await mkdir(path.join(root, "inbox"), { recursive: true });
  await mkdir(path.join(root, "tags"), { recursive: true });
  await mkdir(path.join(root, "templates"), { recursive: true });
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "assets", "previews"), { recursive: true });

  await writeFile(
    path.join(root, "README.md"),
    [
      "# GPT Image 2 Prompt Library",
      "## 精选提示词",
      "## 按使用场景浏览",
      "## 热门效果标签",
      "## 最近新增",
      "## 如何使用",
    ].join("\n\n"),
  );

  await writeFile(path.join(root, "inbox", "README.md"), "# Inbox\n");
  await writeFile(path.join(root, "tags", "README.md"), "# Tags\n");
  await writeFile(path.join(root, "templates", "prompt-card.md"), "# Template\n");

  for (const scene of ["scene-a", "scene-b", "scene-c"]) {
    await mkdir(path.join(root, "library", scene), { recursive: true });
  }

  for (let index = 1; index <= 11; index += 1) {
    const scene = index <= 4 ? "scene-a" : index <= 8 ? "scene-b" : "scene-c";
    await writeFile(
      path.join(root, "library", scene, `card-${index}.md`),
      [
        "---",
        `title: Card ${index}`,
        "status: polished",
        "cover: ../../assets/covers/example.svg",
        "preview: ../../assets/previews/example-preview.svg",
        "preview_type: generated",
        "preview_source: generated from this prompt",
        "scene: 产品展示图",
        "tags:",
        "  - 海报感",
        "prompt: Prompt summary",
        "summary: Card summary",
        "source: https://example.com/source",
        "collected_at: 2026-05-02",
        "---",
        "",
        `# Card ${index}`,
        "",
        "## 变量说明",
        "",
        "- Replace the subject.",
        "",
        "## 生成注意事项",
        "",
        "- Check generated text.",
      ].join("\n"),
    );
  }

  const result = await validateRepo(root);

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /at least 4 scene directories/);
  assert.match(result.errors.join("\n"), /at least 12 prompt cards/);
});

test("validateRepo reports missing preview asset when preview field is present", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prompt-repo-preview-"));

  await mkdir(path.join(root, "inbox"), { recursive: true });
  await mkdir(path.join(root, "tags"), { recursive: true });
  await mkdir(path.join(root, "templates"), { recursive: true });
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "library", "scene-a"), { recursive: true });
  await mkdir(path.join(root, "library", "scene-b"), { recursive: true });
  await mkdir(path.join(root, "library", "scene-c"), { recursive: true });
  await mkdir(path.join(root, "library", "scene-d"), { recursive: true });

  await writeFile(
    path.join(root, "README.md"),
    [
      "# GPT Image 2 Prompt Library",
      "## 精选提示词",
      "## 按使用场景浏览",
      "## 热门效果标签",
      "## 最近新增",
      "## 如何使用",
    ].join("\n\n"),
  );

  await writeFile(path.join(root, "inbox", "README.md"), "# Inbox\n");
  await writeFile(path.join(root, "tags", "README.md"), "# Tags\n");
  await writeFile(path.join(root, "templates", "prompt-card.md"), "# Template\n");

  for (const [index, scene] of [
    "scene-a",
    "scene-a",
    "scene-a",
    "scene-b",
    "scene-b",
    "scene-b",
    "scene-c",
    "scene-c",
    "scene-c",
    "scene-d",
    "scene-d",
    "scene-d",
  ].entries()) {
    await writeFile(
      path.join(root, "library", scene, `card-${index + 1}.md`),
      [
        "---",
        `title: Card ${index + 1}`,
        "status: polished",
        "cover: ../../assets/covers/example.svg",
        "preview: ../../assets/previews/missing-preview.svg",
        "preview_type: generated",
        "preview_source: generated from this prompt",
        "scene: 产品展示图",
        "tags:",
        "  - 信息图",
        "prompt: Prompt summary",
        "summary: Card summary",
        "source: https://example.com/source",
        "collected_at: 2026-05-02",
        "---",
        "",
        `# Card ${index + 1}`,
        "",
        "## 变量说明",
        "",
        "- Replace the subject.",
        "",
        "## 生成注意事项",
        "",
        "- Check generated text.",
      ].join("\n"),
    );
  }

  const result = await validateRepo(root);

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /missing preview asset/);
});

test("validateRepo requires preview source metadata when preview field is present", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prompt-repo-preview-meta-"));

  await mkdir(path.join(root, "inbox"), { recursive: true });
  await mkdir(path.join(root, "tags"), { recursive: true });
  await mkdir(path.join(root, "templates"), { recursive: true });
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "assets", "previews"), { recursive: true });
  for (const scene of ["scene-a", "scene-b", "scene-c", "scene-d"]) {
    await mkdir(path.join(root, "library", scene), { recursive: true });
  }

  await writeFile(
    path.join(root, "README.md"),
    [
      "# GPT Image 2 Prompt Library",
      "## 精选提示词",
      "## 按使用场景浏览",
      "## 热门效果标签",
      "## 最近新增",
      "## 如何使用",
    ].join("\n\n"),
  );

  await writeFile(path.join(root, "inbox", "README.md"), "# Inbox\n");
  await writeFile(path.join(root, "tags", "README.md"), "# Tags\n");
  await writeFile(path.join(root, "templates", "prompt-card.md"), "# Template\n");
  await writeFile(
    path.join(root, "assets", "previews", "example-preview.svg"),
    "<svg></svg>\n",
  );

  for (const [index, scene] of [
    "scene-a",
    "scene-a",
    "scene-a",
    "scene-b",
    "scene-b",
    "scene-b",
    "scene-c",
    "scene-c",
    "scene-c",
    "scene-d",
    "scene-d",
    "scene-d",
  ].entries()) {
    await writeFile(
      path.join(root, "library", scene, `card-${index + 1}.md`),
      [
        "---",
        `title: Card ${index + 1}`,
        "status: polished",
        "cover: ../../assets/covers/example.svg",
        "preview: ../../assets/previews/example-preview.svg",
        "scene: 产品展示图",
        "tags:",
        "  - 信息图",
        "prompt: Prompt summary",
        "summary: Card summary",
        "source: https://example.com/source",
        "collected_at: 2026-05-02",
        "---",
        "",
        `# Card ${index + 1}`,
        "",
        "## 变量说明",
        "",
        "- Replace the subject.",
        "",
        "## 生成注意事项",
        "",
        "- Check generated text.",
      ].join("\n"),
    );
  }

  const result = await validateRepo(root);

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /preview_type/);
  assert.match(result.errors.join("\n"), /preview_source/);
});
