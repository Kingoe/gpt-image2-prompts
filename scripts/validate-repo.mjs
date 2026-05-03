import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const REQUIRED_DIRECTORIES = [
  "inbox",
  "library",
  "tags",
  "templates",
  path.join("assets", "covers"),
];

const REQUIRED_README_SECTIONS = [
  "精选提示词",
  "按使用场景浏览",
  "热门效果标签",
  "最近新增",
  "如何使用",
];

const REQUIRED_FRONTMATTER_FIELDS = [
  "title",
  "cover",
  "scene",
  "tags",
  "prompt",
  "summary",
  "source",
  "collected_at",
];

export async function validateRepo(rootDir = process.cwd()) {
  const errors = [];

  for (const dir of REQUIRED_DIRECTORIES) {
    const fullPath = path.join(rootDir, dir);
    if (!(await exists(fullPath))) {
      errors.push(`Missing directory: ${dir}`);
    }
  }

  const readmePath = path.join(rootDir, "README.md");
  if (!(await exists(readmePath))) {
    errors.push("Missing file: README.md");
  } else {
    const readme = await readFile(readmePath, "utf8");
    for (const section of REQUIRED_README_SECTIONS) {
      if (!readme.includes(`## ${section}`)) {
        errors.push(`README.md is missing section: ${section}`);
      }
    }
  }

  const libraryDir = path.join(rootDir, "library");
  if (await exists(libraryDir)) {
    const sceneDirectories = await collectSceneDirectories(libraryDir);
    const entryFiles = await walkMarkdownFiles(libraryDir);
    const cardFiles = entryFiles.filter(
      (filePath) => path.basename(filePath) !== "README.md",
    );

    if (cardFiles.length === 0) {
      errors.push("library/ does not contain any prompt cards");
    }
    if (sceneDirectories.length < 4) {
      errors.push("library/ should contain at least 4 scene directories");
    }
    if (cardFiles.length < 12) {
      errors.push("library/ should contain at least 12 prompt cards");
    }

    for (const filePath of cardFiles) {
      const content = await readFile(filePath, "utf8");
      const frontmatter = parseFrontmatter(content);

      if (!frontmatter) {
        errors.push(`${path.basename(filePath)} is missing frontmatter`);
        continue;
      }

      for (const field of REQUIRED_FRONTMATTER_FIELDS) {
        if (!(field in frontmatter) || isBlank(frontmatter[field])) {
          errors.push(
            `${path.basename(filePath)} is missing frontmatter field: ${field}`,
          );
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkMarkdownFiles(rootDir) {
  const output = [];
  const entries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await walkMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      output.push(fullPath);
    }
  }

  return output;
}

async function collectSceneDirectories(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fields = {};
  let currentListKey = null;

  for (const rawLine of match[1].split("\n")) {
    const listMatch = rawLine.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentListKey) {
      fields[currentListKey].push(listMatch[1].trim());
      continue;
    }

    const fieldMatch = rawLine.match(/^([a-z_]+):\s*(.*)$/);
    if (!fieldMatch) continue;

    const [, key, value] = fieldMatch;
    if (value === "") {
      fields[key] = [];
      currentListKey = key;
    } else {
      fields[key] = value.trim();
      currentListKey = null;
    }
  }

  return fields;
}

function isBlank(value) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return typeof value !== "string" || value.trim() === "";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await validateRepo(process.cwd());

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Repository validation passed.");
  }
}
