const state = {
  prompts: [],
  scenes: [],
  tags: [],
  summary: {},
  scene: "",
  tag: "",
  query: "",
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
};

boot();

async function boot() {
  try {
    const [prompts, scenes, tags, summary] = await Promise.all([
      fetchJson("../site-data/prompts.json"),
      fetchJson("../site-data/scenes.json"),
      fetchJson("../site-data/tags.json"),
      fetchJson("../site-data/summary.json"),
    ]);

    state.prompts = prompts;
    state.scenes = scenes;
    state.tags = tags;
    state.summary = summary;

    renderSummary();
    renderFeatured();
    renderFilters();
    renderGrid();
    bindEvents();
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
  });

  els.resetFilters.addEventListener("click", () => {
    state.scene = "";
    state.tag = "";
    state.query = "";
    els.searchInput.value = "";
    renderFilters();
    renderGrid();
  });

  els.dialogClose.addEventListener("click", () => els.dialog.close());
  els.dialog.addEventListener("click", (event) => {
    if (event.target === els.dialog) els.dialog.close();
  });
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
        <button class="chip ${state.scene === scene.slug ? "is-active" : ""}"
          type="button" data-scene="${escapeHtml(scene.slug)}">
          ${escapeHtml(scene.name)} · ${scene.count}
        </button>
      `,
    )
    .join("");

  els.tagFilters.innerHTML = state.tags
    .slice(0, 28)
    .map(
      (tag) => `
        <button class="chip ${state.tag === tag.name ? "is-active" : ""}"
          type="button" data-tag="${escapeHtml(tag.name)}">
          ${escapeHtml(tag.name)} · ${tag.count}
        </button>
      `,
    )
    .join("");

  els.sceneFilters.querySelectorAll("[data-scene]").forEach((button) => {
    button.addEventListener("click", () => {
      state.scene = state.scene === button.dataset.scene ? "" : button.dataset.scene;
      renderFilters();
      renderGrid();
    });
  });

  els.tagFilters.querySelectorAll("[data-tag]").forEach((button) => {
    button.addEventListener("click", () => {
      state.tag = state.tag === button.dataset.tag ? "" : button.dataset.tag;
      renderFilters();
      renderGrid();
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
      <img src="../${escapeHtml(prompt.preview || prompt.cover)}" alt="${escapeHtml(prompt.title)} 预览图" loading="lazy" />
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

  els.dialogImage.src = `../${prompt.preview || prompt.cover}`;
  els.dialogImage.alt = `${prompt.title} 预览图`;
  els.dialogScene.textContent = prompt.scene;
  els.dialogTitle.textContent = prompt.title;
  els.dialogSummary.textContent = prompt.summary;
  els.dialogTags.innerHTML = prompt.tags
    .map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`)
    .join("");
  els.dialogLink.href = `../${prompt.path}`;
  els.dialogPrompt.textContent = prompt.prompt;
  els.copyPrompt.textContent = "复制提示词";
  els.copyPrompt.onclick = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    els.copyPrompt.textContent = "已复制";
    window.setTimeout(() => {
      els.copyPrompt.textContent = "复制提示词";
    }, 1400);
  };

  els.dialog.showModal();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
