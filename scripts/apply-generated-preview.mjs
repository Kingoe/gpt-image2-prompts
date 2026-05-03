import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export async function applyGeneratedPreview({
  rootDir = process.cwd(),
  cardPath,
  imagePath,
  previewSource = "generated from this prompt",
} = {}) {
  if (!cardPath || !imagePath) {
    throw new Error("cardPath and imagePath are required");
  }

  const resolvedCardPath = path.resolve(rootDir, cardPath);
  const resolvedImagePath = path.resolve(rootDir, imagePath);

  await assertFile(resolvedCardPath, "Prompt card");
  await assertFile(resolvedImagePath, "Preview image");

  const content = await readFile(resolvedCardPath, "utf8");
  const relativePreviewPath = toMarkdownPath(
    path.relative(path.dirname(resolvedCardPath), resolvedImagePath),
  );

  const updated = updatePreviewSection(
    updateFrontmatter(content, {
      preview: relativePreviewPath,
      preview_type: "generated",
      preview_source: previewSource,
    }),
    relativePreviewPath,
  );

  await writeFile(resolvedCardPath, updated);

  return {
    cardPath: resolvedCardPath,
    preview: relativePreviewPath,
  };
}

async function assertFile(filePath, label) {
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      throw new Error(`${label} is not a file: ${filePath}`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`${label} does not exist: ${filePath}`);
    }
    throw error;
  }
}

function updateFrontmatter(content, fields) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error("Prompt card is missing YAML frontmatter");
  }

  let lines = match[1].split("\n");
  for (const [key, value] of Object.entries(fields)) {
    lines = setFrontmatterField(lines, key, value);
  }

  return content.replace(match[0], ["---", ...lines, "---"].join("\n"));
}

function setFrontmatterField(lines, key, value) {
  const nextLine = `${key}: ${value}`;
  const index = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (index >= 0) {
    return lines.map((line, lineIndex) => (lineIndex === index ? nextLine : line));
  }

  const insertAfter = findLastFieldIndex(lines, [
    "preview_source",
    "preview_type",
    "preview",
    "cover",
  ]);
  const nextLines = [...lines];
  nextLines.splice(insertAfter + 1, 0, nextLine);
  return nextLines;
}

function findLastFieldIndex(lines, keys) {
  const indexes = keys
    .map((key) => lines.findIndex((line) => line.startsWith(`${key}:`)))
    .filter((index) => index >= 0);

  return indexes.length > 0 ? Math.max(...indexes) : -1;
}

function updatePreviewSection(content, previewPath) {
  const title = extractTitle(content);
  const imageMarkdown = `![${title}预览](${previewPath})`;
  const previewImagePattern = /(## 效果预览\n\n)!\[[^\]]*\]\([^)]+\)/;

  if (previewImagePattern.test(content)) {
    return content.replace(previewImagePattern, `$1${imageMarkdown}`);
  }

  const titlePattern = /(# .+\n)/;
  if (!titlePattern.test(content)) {
    throw new Error("Prompt card is missing an H1 title");
  }

  return content.replace(
    titlePattern,
    `$1\n## 效果预览\n\n${imageMarkdown}\n`,
  );
}

function extractTitle(content) {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  const titleMatch = content.match(/^title:\s*(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  return "效果图";
}

function toMarkdownPath(filePath) {
  return filePath.split(path.sep).join("/");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cardPath, imagePath] = process.argv.slice(2);

  if (!cardPath || !imagePath) {
    console.error(
      "Usage: npm run preview:apply -- <library/card.md> <assets/previews/generated.png>",
    );
    process.exitCode = 1;
  } else {
    try {
      const result = await applyGeneratedPreview({ cardPath, imagePath });
      console.log(`Updated ${path.relative(process.cwd(), result.cardPath)}`);
      console.log(`Preview: ${result.preview}`);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
