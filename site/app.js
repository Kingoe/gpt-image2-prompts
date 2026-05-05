const state = {
  prompts: [],
  scenes: [],
  tags: [],
  summary: {},
  scene: "",
  tag: "",
  query: "",
  initialPromptId: "",
};

const config = window.PROMPT_ATLAS_CONFIG ?? {
  assetBase: "..",
  dataBase: "../site-data",
  linkBase: "..",
  repositoryUrl: "https://github.com/Kingoe/gpt-image2-prompts",
  initialScene: "",
  initialTag: "",
  staticPages: false,
};

const els = {
  summaryPrompts: document.querySelector("#summary-prompts"),
  summaryRows: document.querySelector("#summary-rows"),
  featuredList: document.querySelector("#featured-list"),
  sceneFilters: document.querySelector("#scene-filters"),
  tagFilters: document.querySelector("#tag-filters"),
  promptGrid: document.querySelector("#prompt-grid"),
  searchInput: document.querySelector("#search-input"),
  resetFilters: document.querySelector("#reset-filters"),
  resultLine: document.querySelector("#result-line"),
  dialog: document.querySelector("#prompt-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  dialogImage: document.querySelector("#dialog-image"),
  dialogScene: document.querySelector("#dialog-scene"),
  dialogTitle: document.querySelector("#dialog-title"),
  dialogSummary: document.querySelector("#dialog-summary"),
  dialogTags: document.querySelector("#dialog-tags"),
  dialogLink: document.querySelector("#dialog-link"),
  dialogPrompt: document.querySelector("#dialog-prompt"),
  copyPrompt: document.querySelector("#copy-prompt"),
  copyLink: document.querySelector("#copy-link"),
};

boot();

async function boot() {
  try {
    const [prompts, scenes, tags, summary] = await Promise.all([
      fetchJson(joinUrl(config.dataBase, "prompts.json")),
      fetchJson(joinUrl(config.dataBase, "scenes.json")),
      fetchJson(joinUrl(config.dataBase, "tags.json")),
      fetchJson(joinUrl(config.dataBase, "summary.json")),
    ]);

    state.prompts = prompts;
    state.scenes = scenes;
    state.tags = tags;
    state.summary = summary;

    hydrateStateFromUrl();
    renderSummary();
    renderFeatured();
    renderFilters();
    renderGrid();
    bindEvents();
    openInitialPromptFromUrl();
  } catch (error) {
    els.resultLine.textContent = "站点数据载入失败，请先运行 npm run export:site-data。";
    console.error(error);
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    renderGrid();
    syncUrl({ promptId: "" });
  });

  els.resetFilters.addEventListener("click", () => {
    if (config.initialScene || config.initialTag) {
      window.location.href = joinUrl(config.linkBase, "#browse");
      return;
    }

    state.scene = "";
    state.tag = "";
    state.query = "";
    els.searchInput.value = "";
    renderFilters();
    renderGrid();
    syncUrl({ promptId: "" });
  });

  els.dialogClose.addEventListener("click", () => closeDialog());
  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) closeDialog();
  });
  els.dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
}

function hydrateStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get("scene") ?? config.initialScene ?? "";
  const tag = params.get("tag") ?? config.initialTag ?? "";

  state.scene = state.scenes.some((item) => item.slug === scene) ? scene : "";
  state.tag = state.tags.some((item) => item.name === tag) ? tag : "";
  state.query = params.get("q")?.trim() ?? "";
  state.initialPromptId = params.get("prompt") ?? "";
  els.searchInput.value = state.query;
}

function renderSummary() {
  els.summaryPrompts.textContent = state.summary.prompts;
  els.summaryRows.innerHTML = [
    `${state.summary.scenes} Scenes`,
    `${state.summary.generated_previews} Previews`,
    `${state.summary.featured} Featured`,
  ]
    .map((item) => `<span>${item}</span>`)
    .join("");
}

function renderFeatured() {
  const featured = state.prompts.filter((prompt) => prompt.featured).slice(0, 16);
  els.featuredList.innerHTML = featured.map(cardTemplate).join("");
  bindCards(els.featuredList);
}

function renderFilters() {
  els.sceneFilters.innerHTML = state.scenes
    .map(
      (scene) => `
        <a class="chip ${state.scene === scene.slug ? "is-active" : ""}"
          href="${escapeHtml(listingUrl("scenes", scene.slug))}" data-scene="${escapeHtml(scene.slug)}">
          ${escapeHtml(scene.name)} · ${scene.count}
        </a>
      `,
    )
    .join("");

  els.tagFilters.innerHTML = state.tags
    .slice(0, 28)
    .map(
      (tag) => `
        <a class="chip ${state.tag === tag.name ? "is-active" : ""}"
          href="${escapeHtml(listingUrl("tags", tag.slug))}" data-tag="${escapeHtml(tag.name)}">
          ${escapeHtml(tag.name)} · ${tag.count}
        </a>
      `,
    )
    .join("");

  if (!config.staticPages) {
    bindLocalFilterLinks();
  }
}

function bindLocalFilterLinks() {
  els.sceneFilters.querySelectorAll("[data-scene]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      state.scene = state.scene === link.dataset.scene ? "" : link.dataset.scene;
      renderFilters();
      renderGrid();
      syncUrl({ promptId: "" });
    });
  });

  els.tagFilters.querySelectorAll("[data-tag]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      state.tag = state.tag === link.dataset.tag ? "" : link.dataset.tag;
      renderFilters();
      renderGrid();
      syncUrl({ promptId: "" });
    });
  });
}

function renderGrid() {
  const prompts = filteredPrompts();
  els.resultLine.textContent = `共找到 ${prompts.length} 条提示词`;
  els.promptGrid.innerHTML = prompts.map(cardTemplate).join("");
  bindCards(els.promptGrid);
}

function filteredPrompts() {
  const query = state.query.toLowerCase();
  return state.prompts.filter((prompt) => {
    const matchesScene = !state.scene || prompt.scene_slug === state.scene;
    const matchesTag = !state.tag || prompt.tags.includes(state.tag);
    const searchable = [
      prompt.title,
      prompt.scene,
      prompt.summary,
      prompt.prompt,
      ...prompt.tags,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    return matchesScene && matchesTag && matchesQuery;
  });
}

function cardTemplate(prompt) {
  return `
    <article class="prompt-card" tabindex="0" role="button" data-id="${escapeHtml(prompt.id)}">
      <img src="${escapeHtml(joinUrl(config.assetBase, prompt.preview || prompt.cover))}" alt="${escapeHtml(prompt.title)} 预览图" loading="lazy" />
      <div class="prompt-card__body">
        <div class="prompt-card__scene">${escapeHtml(prompt.scene)}</div>
        <h3>${escapeHtml(prompt.title)}</h3>
        <p>${escapeHtml(prompt.summary)}</p>
        <div class="tag-row">
          ${prompt.tags.slice(0, 3).map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function bindCards(root) {
  root.querySelectorAll(".prompt-card").forEach((card) => {
    const open = () => openDialog(card.dataset.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function openDialog(id) {
  const prompt = state.prompts.find((item) => item.id === id);
  if (!prompt) return;

  els.dialogImage.src = joinUrl(config.assetBase, prompt.preview || prompt.cover);
  els.dialogImage.alt = `${prompt.title} 预览图`;
  els.dialogScene.textContent = prompt.scene;
  els.dialogTitle.textContent = prompt.title;
  els.dialogSummary.textContent = prompt.summary;
  els.dialogTags.innerHTML = prompt.tags
    .map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`)
    .join("");
  els.dialogLink.href = githubBlobUrl(prompt.path);
  els.dialogPrompt.textContent = prompt.prompt;
  els.copyPrompt.textContent = "复制提示词";
  els.copyLink.textContent = "复制链接";
  els.copyPrompt.onclick = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    els.copyPrompt.textContent = "已复制";
    window.setTimeout(() => {
      els.copyPrompt.textContent = "复制提示词";
    }, 1400);
  };
  els.copyLink.onclick = async () => {
    const shareUrl = promptShareUrl(prompt.id);
    await navigator.clipboard.writeText(shareUrl);
    els.copyLink.textContent = "已复制";
    window.setTimeout(() => {
      els.copyLink.textContent = "复制链接";
    }, 1400);
  };

  els.dialog.showModal();
  syncUrl({ promptId: prompt.id });
}

function openInitialPromptFromUrl() {
  if (!state.initialPromptId) return;
  window.requestAnimationFrame(() => openDialog(state.initialPromptId));
}

function closeDialog() {
  els.dialog.close();
  syncUrl({ promptId: "" });
}

function promptShareUrl(id) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("prompt", id);
  return url.toString();
}

function syncUrl({ promptId } = {}) {
  const url = new URL(window.location.href);

  setOrDeleteParam(url.searchParams, "scene", state.scene);
  setOrDeleteParam(url.searchParams, "tag", state.tag);
  setOrDeleteParam(url.searchParams, "q", state.query);

  if (promptId !== undefined) {
    setOrDeleteParam(url.searchParams, "prompt", promptId);
  }

  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function setOrDeleteParam(params, key, value) {
  if (value) {
    params.set(key, value);
  } else {
    params.delete(key);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function joinUrl(base, target) {
  const cleanBase = String(base).replace(/\/+$/g, "");
  const cleanTarget = String(target).replace(/^\/+/g, "");

  if (!cleanBase) {
    return `/${cleanTarget}`;
  }

  if (cleanBase === ".") {
    return `./${cleanTarget}`;
  }

  return `${cleanBase}/${cleanTarget}`;
}

function githubBlobUrl(target) {
  const cleanRepo = String(config.repositoryUrl).replace(/\/+$/g, "");
  const cleanTarget = String(target).replace(/^\/+/g, "");
  return `${cleanRepo}/blob/main/${cleanTarget}`;
}

function listingUrl(type, slug) {
  return joinUrl(config.linkBase, `${type}/${encodeURIComponent(slug)}/`);
}
