import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  importInboxPrompt,
  parsePromptOnlyEntry,
} from "../scripts/import-inbox-prompt.mjs";

test("parsePromptOnlyEntry extracts metadata and prompt body", () => {
  const entry = [
    "来源：`user-submitted prompt`",
    "拟定标题：`五一旅行美食推荐海报`",
    "场景判断：`社媒贴文`",
    "标签：`旅行美食` `信息卡片` `9比16海报`",
    "备注：适合做城市旅行和景点攻略图。",
    "",
    "提示词：",
    "```text",
    "第一行提示词",
    "第二行提示词",
    "```",
  ].join("\n");

  const result = parsePromptOnlyEntry(entry);

  assert.deepEqual(result, {
    source: "user-submitted prompt",
    title: "五一旅行美食推荐海报",
    scene: "社媒贴文",
    tags: ["旅行美食", "信息卡片", "9比16海报"],
    note: "适合做城市旅行和景点攻略图。",
    prompt: "第一行提示词\n第二行提示词",
  });
});

test("importInboxPrompt creates a prompt card in the matching library directory", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prompt-import-"));
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "library", "social-media-post"), {
    recursive: true,
  });
  await mkdir(path.join(root, "inbox"), { recursive: true });

  await writeFile(
    path.join(root, "library", "social-media-post", "README.md"),
    "# 社媒贴文\n",
  );
  await writeFile(
    path.join(root, "assets", "covers", "example.svg"),
    "<svg></svg>\n",
  );

  const sourcePath = path.join(root, "inbox", "travel-food.txt");
  await writeFile(
    sourcePath,
    [
      "来源：`from screenshot`",
      "拟定标题：`旅行美食海报`",
      "场景判断：`社媒贴文`",
      "标签：`旅行美食` `信息卡片`",
      "备注：适合做节假日攻略图。",
      "",
      "提示词：",
      "```text",
      "生成一张旅行美食海报",
      "```",
    ].join("\n"),
  );

  const result = await importInboxPrompt({
    rootDir: root,
    sourcePath,
    collectedAt: "2026-05-03",
  });

  assert.equal(
    result.outputPath,
    path.join(root, "library", "social-media-post", "travel-food.md"),
  );

  const content = await readFile(result.outputPath, "utf8");
  assert.match(content, /title: 旅行美食海报/);
  assert.match(content, /status: needs-preview/);
  assert.match(content, /> 状态：`needs-preview`/);
  assert.match(content, /scene: 社媒贴文/);
  assert.match(content, /source: from screenshot/);
  assert.match(content, /collected_at: 2026-05-03/);
  assert.match(content, /summary: 适合做节假日攻略图。/);
  assert.match(content, /生成一张旅行美食海报/);
  assert.match(content, /适合用于社媒贴文相关内容。/);
  assert.match(content, /## 变量说明/);
  assert.match(content, /## 生成注意事项/);
});

test("importInboxPrompt rejects unknown scene labels", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "prompt-import-fail-"));
  await mkdir(path.join(root, "assets", "covers"), { recursive: true });
  await mkdir(path.join(root, "library", "social-media-post"), {
    recursive: true,
  });
  await mkdir(path.join(root, "inbox"), { recursive: true });

  await writeFile(
    path.join(root, "library", "social-media-post", "README.md"),
    "# 社媒贴文\n",
  );
  await writeFile(
    path.join(root, "assets", "covers", "example.svg"),
    "<svg></svg>\n",
  );

  const sourcePath = path.join(root, "inbox", "unknown-scene.txt");
  await writeFile(
    sourcePath,
    [
      "来源：`user-submitted prompt`",
      "拟定标题：`未知分类提示词`",
      "场景判断：`不存在的场景`",
      "标签：`标签 1`",
      "备注：测试错误处理。",
      "",
      "提示词：",
      "```text",
      "测试提示词",
      "```",
    ].join("\n"),
  );

  await assert.rejects(
    () =>
      importInboxPrompt({
        rootDir: root,
        sourcePath,
        collectedAt: "2026-05-03",
      }),
    /Unknown scene label/,
  );
});
