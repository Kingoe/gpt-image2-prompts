import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_DATA_DIR = "site-data";

export async function buildSiteData(rootDir = process.cwd()) {
  const libraryDir = path.join(rootDir, "library");
  const readme = await readOptional(path.join(rootDir, "README.md"));
  const featuredPaths = extractFeaturedPaths(readme);
  const cardFiles = (await walkMarkdownFiles(libraryDir)).filter(
    (filePath) => path.basename(filePath) !== "README.md",
  );

  const prompts = [];

  for (const filePath of cardFiles) {
    const content = await readFile(filePath, "utf8");
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      throw new Error(`Missing frontmatter: ${relativePath(rootDir, filePath)}`);
    }

    const cardPath = relativePath(rootDir, filePath);
    const sceneSlug = path.basename(path.dirname(filePath));
    const prompt = extractPromptFromBody(content) ?? frontmatter.prompt ?? "";

    prompts.push({
      id: `${sceneSlug}/${path.basename(filePath, ".md")}`,
      title: frontmatter.title,
      status: frontmatter.status,
      scene: frontmatter.scene,
      scene_slug: sceneSlug,
      tags: frontmatter.tags ?? [],
      summary: frontmatter.summary,
      prompt,
      source: frontmatter.source,
      collected_at: frontmatter.collected_at,
      cover: resolveRepoPath(rootDir, filePath, frontmatter.cover),
      preview: resolveRepoPath(rootDir, filePath, frontmatter.preview),
      preview_type: frontmatter.preview_type ?? "",
      preview_source: frontmatter.preview_source ?? "",
      path: cardPath,
      featured: featuredPaths.has(cardPath),
    });
  }

  prompts.sort((a, b) => a.path.localeCompare(b.path));

  const scenes = aggregateScenes(prompts);
  const tags = aggregateTags(prompts);

  return {
    generated_at: new Date().toISOString().slice(0, 10),
    totals: {
      prompts: prompts.length,
      scenes: scenes.length,
      tags: tags.length,
      generated_previews: prompts.filter((prompt) => prompt.preview_type === "generated").length,
      polished: prompts.filter((prompt) => prompt.status === "polished").length,
      featured: prompts.filter((prompt) => prompt.featured).length,
    },
    prompts,
    scenes,
    tags,
  };
}

export async function writeSiteData(rootDir = process.cwd()) {
  const data = await buildSiteData(rootDir);
  const outputDir = path.join(rootDir, SITE_DATA_DIR);
  await mkdir(outputDir, { recursive: true });

  await writeJson(path.join(outputDir, "prompts.json"), data.prompts);
  await writeJson(path.join(outputDir, "scenes.json"), data.scenes);
  await writeJson(path.join(outputDir, "tags.json"), data.tags);
  await writeJson(path.join(outputDir, "summary.json"), data.totals);

  return data;
}

export async function checkSiteData(rootDir = process.cwd()) {
  const data = await buildSiteData(rootDir);
  const checks = [
    ["prompts.json", data.prompts],
    ["scenes.json", data.scenes],
    ["tags.json", data.tags],
    ["summary.json", data.totals],
  ];
  const mismatches = [];

  for (const [fileName, value] of checks) {
    const expected = `${JSON.stringify(value, null, 2)}\n`;
    const targetPath = path.join(rootDir, SITE_DATA_DIR, fileName);
    const actual = await readOptional(targetPath);
    if (actual !== expected) {
      mismatches.push(path.join(SITE_DATA_DIR, fileName));
    }
  }

  return {
    ok: mismatches.length === 0,
    mismatches,
  };
}

function aggregateScenes(prompts) {
  const map = new Map();

  for (const prompt of prompts) {
    const scene = map.get(prompt.scene_slug) ?? {
      slug: prompt.scene_slug,
      name: prompt.scene,
      count: 0,
      generated_previews: 0,
      featured: 0,
      tags: new Set(),
      prompts: [],
    };

    scene.count += 1;
    if (prompt.preview_type === "generated") scene.generated_previews += 1;
    if (prompt.featured) scene.featured += 1;
    for (const tag of prompt.tags) scene.tags.add(tag);
    scene.prompts.push(prompt.id);
    map.set(prompt.scene_slug, scene);
  }

  return [...map.values()]
    .map((scene) => ({
      ...scene,
      tags: [...scene.tags].sort((a, b) => a.localeCompare(b, "zh-CN")),
      prompts: scene.prompts.sort(),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function aggregateTags(prompts) {
  const map = new Map();

  for (const prompt of prompts) {
    for (const tagName of prompt.tags) {
      const tag = map.get(tagName) ?? {
        name: tagName,
        slug: slugifyTag(tagName),
        count: 0,
        scenes: new Set(),
        prompts: [],
      };

      tag.count += 1;
      tag.scenes.add(prompt.scene);
      tag.prompts.push(prompt.id);
      map.set(tagName, tag);
    }
  }

  return [...map.values()]
    .map((tag) => ({
      ...tag,
      scenes: [...tag.scenes].sort((a, b) => a.localeCompare(b, "zh-CN")),
      prompts: tag.prompts.sort(),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
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

function extractPromptFromBody(content) {
  const match = content.match(/## 提示词\s*\n+```text\n([\s\S]*?)\n```/);
  return match?.[1].trim();
}

function extractFeaturedPaths(readme) {
  const matches = readme.matchAll(/\]\((library\/[^)]+\.md)\)/g);
  return new Set([...matches].map((match) => match[1]));
}

function resolveRepoPath(rootDir, fromFile, maybeRelativePath) {
  if (!maybeRelativePath) return "";
  const absolutePath = path.resolve(path.dirname(fromFile), maybeRelativePath);
  return relativePath(rootDir, absolutePath);
}

function relativePath(rootDir, targetPath) {
  return path.relative(rootDir, targetPath).split(path.sep).join("/");
}

function slugifyTag(tag) {
  return tag
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function readOptional(targetPath) {
  try {
    return await readFile(targetPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

async function writeJson(targetPath, value) {
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`);
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
  const checkMode = process.argv.includes("--check");

  if (checkMode) {
    const result = await checkSiteData(process.cwd());
    if (!result.ok) {
      for (const filePath of result.mismatches) {
        console.error(`- ${filePath} is out of date`);
      }
      process.exitCode = 1;
    } else {
      console.log("Site data is up to date.");
    }
  } else {
    const outputDir = path.join(process.cwd(), SITE_DATA_DIR);
    if (!(await exists(outputDir))) {
      await mkdir(outputDir, { recursive: true });
    }
    const data = await writeSiteData(process.cwd());
    console.log(
      `Exported ${data.totals.prompts} prompts, ${data.totals.scenes} scenes, ${data.totals.tags} tags.`,
    );
  }
}
