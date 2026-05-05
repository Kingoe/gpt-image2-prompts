import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_BASE_PATH = "/prompt-atlas/";
const DEFAULT_DIST_DIR = "dist";
const DEFAULT_SITE_URL = "https://kingoecode.com";

export async function buildSite({
  rootDir = process.cwd(),
  basePath = process.env.BASE_PATH ?? DEFAULT_BASE_PATH,
  distDir = process.env.DIST_DIR ?? DEFAULT_DIST_DIR,
  siteUrl = process.env.SITE_URL ?? DEFAULT_SITE_URL,
} = {}) {
  const normalizedBasePath = normalizeBasePath(basePath);
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const distPath = path.resolve(rootDir, distDir);

  assertInsideRoot(rootDir, distPath);

  await rm(distPath, { recursive: true, force: true });
  await mkdir(distPath, { recursive: true });

  await copyDirectory(path.join(rootDir, "assets"), path.join(distPath, "assets"));
  await copyDirectory(path.join(rootDir, "site-data"), path.join(distPath, "site-data"));
  await copyDirectory(path.join(rootDir, "library"), path.join(distPath, "library"));
  await copyDirectory(path.join(rootDir, "tags"), path.join(distPath, "tags"));

  await cp(path.join(rootDir, "README.md"), path.join(distPath, "README.md"));
  await cp(path.join(rootDir, "CONTRIBUTING.md"), path.join(distPath, "CONTRIBUTING.md"));
  await cp(path.join(rootDir, "site", "styles.css"), path.join(distPath, "styles.css"));
  await cp(path.join(rootDir, "site", "app.js"), path.join(distPath, "app.js"));
  await cp(path.join(rootDir, "site", "favicon.svg"), path.join(distPath, "favicon.svg"));

  const index = await readFile(path.join(rootDir, "site", "index.html"), "utf8");
  await writeFile(
    path.join(distPath, "index.html"),
    transformIndex(index, normalizedBasePath, normalizedSiteUrl),
  );
  await writeListingPages({
    rootDir,
    distPath,
    index,
    basePath: normalizedBasePath,
    siteUrl: normalizedSiteUrl,
  });
  await writeFile(
    path.join(distPath, "deploy-manifest.json"),
    `${JSON.stringify(
      {
        base_path: normalizedBasePath,
        site_url: `${normalizedSiteUrl}${normalizedBasePath}`,
        generated_from: "site/",
        content_source: "library/",
        generated_pages: ["scenes/", "tags/"],
      },
      null,
      2,
    )}\n`,
  );

  return {
    distPath,
    basePath: normalizedBasePath,
    siteUrl: normalizedSiteUrl,
  };
}

function transformIndex(index, basePath, siteUrl, page = {}) {
  const baseRoot = basePath.replace(/\/$/g, "");
  const pagePath = page.path ?? "";
  const publicRoot = `${siteUrl}${basePath}${pagePath}`;
  const shareImage = `${siteUrl}${basePath}assets/previews/cinematic-character-poster-generated.png`;
  const config = {
    assetBase: baseRoot,
    dataBase: `${baseRoot}/site-data`,
    linkBase: baseRoot,
    repositoryUrl: "https://github.com/Kingoe/gpt-image2-prompts",
    initialScene: page.initialScene ?? "",
    initialTag: page.initialTag ?? "",
    staticPages: true,
  };
  const title = page.title ?? "GPT Image 2 Prompt Atlas";
  const description =
    page.description ?? "一个可搜索、可预览、可复制的 GPT Image 2 提示词图鉴。";

  return index
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s+\/>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace(/<link rel="canonical" href="[^"]+" \/>/, `<link rel="canonical" href="${publicRoot}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s+\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s+\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url" content="[^"]+" \/>/, `<meta property="og:url" content="${publicRoot}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s+\/>/, `<meta property="og:image" content="${shareImage}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s+\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s+\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s+\/>/, `<meta name="twitter:image" content="${shareImage}" />`)
    .replace('href="./favicon.svg"', `href="${basePath}favicon.svg"`)
    .replace('href="./styles.css"', `href="${basePath}styles.css"`)
    .replace('src="./app.js"', `src="${basePath}app.js"`)
    .replace(
      /window\.PROMPT_ATLAS_CONFIG = \{[\s\S]*?\};/,
      `window.PROMPT_ATLAS_CONFIG = ${JSON.stringify(config, null, 8)};`,
    );
}

async function writeListingPages({ rootDir, distPath, index, basePath, siteUrl }) {
  const scenes = await readJsonArray(path.join(rootDir, "site-data", "scenes.json"));
  const tags = await readJsonArray(path.join(rootDir, "site-data", "tags.json"));

  for (const scene of scenes) {
    const pagePath = `scenes/${encodeURIComponent(scene.slug)}/`;
    await writeGeneratedPage({
      distPath,
      pagePath: `scenes/${scene.slug}`,
      html: transformIndex(index, basePath, siteUrl, {
        path: pagePath,
        title: `${scene.name} - Prompt Atlas`,
        description: `浏览 ${scene.name} 场景下的 ${scene.count} 条 GPT Image 2 提示词。`,
        initialScene: scene.slug,
      }),
    });
  }

  for (const tag of tags) {
    const pagePath = `tags/${encodeURIComponent(tag.slug)}/`;
    await writeGeneratedPage({
      distPath,
      pagePath: `tags/${tag.slug}`,
      html: transformIndex(index, basePath, siteUrl, {
        path: pagePath,
        title: `${tag.name} 提示词 - Prompt Atlas`,
        description: `浏览 ${tag.name} 标签下的 ${tag.count} 条 GPT Image 2 提示词。`,
        initialTag: tag.name,
      }),
    });
  }
}

async function writeGeneratedPage({ distPath, pagePath, html }) {
  const targetDir = path.join(distPath, pagePath);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, "index.html"), html);
}

async function readJsonArray(filePath) {
  const value = JSON.parse(await readFile(filePath, "utf8"));
  return Array.isArray(value) ? value : [];
}

function normalizeBasePath(value) {
  const trimmed = String(value || "/").trim();
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function normalizeSiteUrl(value) {
  return String(value || DEFAULT_SITE_URL).trim().replace(/\/+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function copyDirectory(source, target) {
  await cp(source, target, { recursive: true });
}

function assertInsideRoot(rootDir, targetPath) {
  const rootPath = path.resolve(rootDir);
  if (!targetPath.startsWith(rootPath)) {
    throw new Error(`Refusing to write outside repository root: ${targetPath}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await buildSite();
  console.log(`Built site at ${path.relative(process.cwd(), result.distPath) || "."}`);
  console.log(`Base path: ${result.basePath}`);
}
