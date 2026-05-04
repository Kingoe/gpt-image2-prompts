import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export function parsePromptOnlyEntry(content) {
  const source = extractInlineField(content, "来源");
  const title = extractInlineField(content, "拟定标题");
  const scene = extractInlineField(content, "场景判断");
  const tags = extractTagList(content);
  const note = extractPlainField(content, "备注");
  const prompt = extractPromptBlock(content);

  if (!source || !title || !scene || tags.length === 0 || !note || !prompt) {
    throw new Error(
      "Prompt-only entry is missing one of the required fields: 来源, 拟定标题, 场景判断, 标签, 备注, 提示词",
    );
  }

  return {
    source,
    title,
    scene,
    tags,
    note,
    prompt,
  };
}

export async function importInboxPrompt({
  rootDir = process.cwd(),
  sourcePath,
  collectedAt = new Date().toISOString().slice(0, 10),
}) {
  if (!sourcePath) {
    throw new Error("sourcePath is required.");
  }

  const raw = await readFile(sourcePath, "utf8");
  const entry = parsePromptOnlyEntry(raw);
  const sceneMap = await loadSceneDirectoryMap(path.join(rootDir, "library"));
  const sceneDirectory = sceneMap.get(entry.scene);

  if (!sceneDirectory) {
    throw new Error(
      `Unknown scene label: ${entry.scene}. Add a matching library/<dir>/README.md heading first.`,
    );
  }

  const sourceStem = path.basename(sourcePath, path.extname(sourcePath));
  const fileName = `${slugify(entry.title, sourceStem)}.md`;
  const outputPath = path.join(rootDir, "library", sceneDirectory, fileName);

  const card = buildPromptCard({
    ...entry,
    collectedAt,
  });

  await writeFile(outputPath, card);

  return {
    outputPath,
    sceneDirectory,
  };
}

async function loadSceneDirectoryMap(libraryRoot) {
  const entries = await readdir(libraryRoot, { withFileTypes: true });
  const sceneMap = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const readmePath = path.join(libraryRoot, entry.name, "README.md");
    if (!(await exists(readmePath))) continue;

    const readme = await readFile(readmePath, "utf8");
    const titleMatch = readme.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      sceneMap.set(titleMatch[1].trim(), entry.name);
    }
  }

  return sceneMap;
}

function buildPromptCard({ title, scene, tags, prompt, note, source, collectedAt }) {
  const frontmatterTags = tags.map((tag) => `  - ${tag}`).join("\n");

  return [
    "---",
    `title: ${title}`,
    "status: needs-preview",
    "cover: ../../assets/covers/example.svg",
    `scene: ${scene}`,
    "tags:",
    frontmatterTags,
    "prompt: >",
    ...prompt.split("\n").map((line) => `  ${line}`),
    `summary: ${note}`,
    `source: ${source}`,
    `collected_at: ${collectedAt}`,
    "---",
    "",
    `# ${title}`,
    "",
    "> 状态：`needs-preview`",
    "",
    "## 适合什么时候用",
    "",
    `适合用于${scene}相关内容。`,
    "",
    "## 提示词",
    "",
    "```text",
    prompt,
    "```",
    "",
    "## 使用建议",
    "",
    "- 先保留这条提示词的核心结构，再按你的真实主题替换主体词。",
    "- 如果后续跑图效果稳定，再把封面、标签和说明补得更细。",
    "- 建议记录哪些词是关键约束，哪些词可以自由替换。",
    "",
    "## 变量说明",
    "",
    "- 优先替换提示词里的占位变量，例如 `{主体}`、`{城市名称}`、`{产品名称}`、`{品牌风格}`。",
    "- 如果没有显式占位变量，就替换主体名词、场景名词和发布渠道，保留构图、材质、光线和比例约束。",
    "- 标签和 `scene` 用于检索，不一定需要原样写进生成提示词。",
    "",
    "## 生成注意事项",
    "",
    "- 生成后优先检查文字、数字、地图、UI 元素和品牌标识是否准确。",
    "- 如果画面包含真实城市、路线、产品结构或界面细节，建议补充更具体的空间关系和视觉约束。",
    "- 如果第一次结果偏乱，先减少信息量，再逐步增加卡片、标签或装饰元素。",
    "",
    "## 来源",
    "",
    `- 原始来源：\`${source}\``,
    `- 收录时间：\`${collectedAt}\``,
    "",
  ].join("\n");
}

function extractInlineField(content, label) {
  const match = content.match(new RegExp(`^${label}：(.+)$`, "m"));
  return normalizeInlineValue(match?.[1] ?? "");
}

function extractTagList(content) {
  const match = content.match(/^标签：(.+)$/m);
  if (!match) return [];
  return [...match[1].matchAll(/`([^`]+)`/g)].map((result) => result[1].trim());
}

function extractPlainField(content, label) {
  const match = content.match(new RegExp(`^${label}：(.+)$`, "m"));
  return match?.[1].trim() ?? "";
}

function extractPromptBlock(content) {
  const fenced = content.match(/提示词：\n```text\n([\s\S]*?)\n```/);
  if (fenced) {
    return fenced[1].replace(/\r\n/g, "\n").trim();
  }

  const plain = content.match(/提示词：\n([\s\S]*)$/);
  return plain?.[1].replace(/\r\n/g, "\n").trim() ?? "";
}

function slugify(value, fallback = "") {
  const ascii = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii) {
    return ascii;
  }

  const normalizedFallback = fallback
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedFallback || `prompt-${Date.now()}`;
}

function normalizeInlineValue(value) {
  const trimmed = value.trim();
  const wrapped = trimmed.match(/^`(.+)`$/);
  return wrapped ? wrapped[1].trim() : trimmed;
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sourcePath = process.argv[2];

  if (!sourcePath) {
    console.error("Usage: node scripts/import-inbox-prompt.mjs <source-file>");
    process.exitCode = 1;
  } else {
    const result = await importInboxPrompt({
      rootDir: process.cwd(),
      sourcePath: path.resolve(process.cwd(), sourcePath),
    });
    console.log(`Created prompt card: ${path.relative(process.cwd(), result.outputPath)}`);
  }
}
