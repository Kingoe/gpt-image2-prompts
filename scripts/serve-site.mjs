import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? "127.0.0.1";
const ROOT = path.resolve(process.cwd(), process.argv[2] ?? ".");
const BASE_PATH = normalizeBasePath(process.argv[3] ?? process.env.BASE_PATH ?? "/");
const DEFAULT_ENTRY = process.argv[2] ? "index.html" : path.join("site", "index.html");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${HOST}:${PORT}`);
  const requestPath = stripBasePath(decodeURIComponent(url.pathname), BASE_PATH);
  const safePath = requestPath.replace(/^\/+/, "");
  const requestedPath = path.resolve(ROOT, safePath || DEFAULT_ENTRY);

  if (!requestedPath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  let filePath = requestedPath;
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  const previewPath = process.argv[2] ? BASE_PATH : "/site/";
  console.log(`Preview site: http://${HOST}:${PORT}${previewPath}`);
});

function normalizeBasePath(value) {
  const raw = String(value || "/");
  if (raw === "/") return "/";
  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function stripBasePath(requestPath, basePath) {
  if (basePath === "/") return requestPath;
  if (requestPath === basePath.slice(0, -1)) return "/";
  if (requestPath.startsWith(basePath)) return `/${requestPath.slice(basePath.length)}`;
  return requestPath;
}
