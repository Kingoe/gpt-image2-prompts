# 模板与规范

## 外部提示词收录规范

当你从别的平台、社群、截图、聊天记录里看到一个不错的提示词时，按下面两种状态处理：

### 1. 还没整理，只想先收下

先放进 `inbox/README.md`，至少记录这 4 项：

- 原始提示词
- 来源链接或来源说明
- 你自己的 1 句备注
- 你判断它属于哪个场景

这一步的目标不是写完整，而是避免以后找不到。

### 2. 已经确认值得长期保留

整理成正式卡片，放进 `library/` 对应目录。即使它只有提示词、没有配图，也可以正式入库。

正式卡片至少补全：

- 标题
- `status`
- `scene`
- `tags`
- `prompt`
- `summary`
- `source`
- `collected_at`

## 只有提示词时的最小入库规则

如果你拿到的是“纯文本提示词”，没有示例图，也没有完整上下文，默认这样处理：

- `cover`：先用同场景封面或通用占位图
- `source`：优先写原始链接；没有链接就写清来源说明，例如 `user-submitted prompt`、`self-collected from screenshot`
- `summary`：用一句话解释“这条提示词能产出什么”
- `使用建议`：写出哪些变量可以替换、哪些核心结构不要删

只要满足这三点，就值得入库：

- 看得懂适合干什么
- 能直接复制使用
- 知道它从哪里来，或者至少知道它是如何被你收进来的

## 质量状态规范

正式卡片必须声明 `status`，用于区分它现在适合怎么展示和复用。

- `polished`：提示词结构完整、来源清楚，最好已经接入真实生成效果图，适合放进 README 精选或对外推荐
- `needs-preview`：提示词已经可用，但还缺真实效果图，或需要继续验证生成稳定性
- `experimental`：想法有价值但还在试验阶段，可能需要改提示词、换构图或补使用说明

默认规则：

- 已经使用当前提示词生成并回填效果图的卡片，优先标记为 `polished`
- 只有提示词、封面或占位预览的卡片，先标记为 `needs-preview`
- 新奇但不稳定的视觉玩法，先标记为 `experimental`，不要急着放进首页精选

## 自动转正式卡片

如果你已经把“纯提示词快速收录格式”写成一个文本文件，可以直接运行：

```bash
npm run import:prompt -- inbox/your-entry.md
```

脚本会自动：

- 解析 `来源 / 拟定标题 / 场景判断 / 标签 / 备注 / 提示词`
- 根据 `场景判断` 找到对应的 `library/<dir>/`
- 生成正式卡片
- 默认使用 `assets/covers/example.svg` 作为封面占位图

适合先快速入库，后续再人工补封面、摘要和使用建议。

## 生成效果图并回填

如果一条卡片已经整理好，但还没有真实效果图，推荐按这个顺序处理：

1. 先在 `preview-requests/` 建一条生成任务，写清卡片路径、目标图片路径、建议比例和补充要求。
2. 用卡片里的完整提示词生成图片。
3. 把生成结果保存到 `assets/previews/`。
4. 运行回填命令：

```bash
npm run preview:apply -- library/scene/card.md assets/previews/card-generated.png
```

脚本会自动更新：

- `preview`
- `preview_type: generated`
- `preview_source: generated from this prompt`
- 正文里的 `## 效果预览` 图片

首批可参考：[preview-requests/first-batch.md](../preview-requests/first-batch.md)。

## 命名规范

- 目录名用英文短横线，保证 GitHub 链接稳定
- 标题和说明保持中文为主
- 单条卡片文件名尽量对应核心视觉效果

## 图片规范

- 封面图统一放在 `assets/covers/`
- 效果预览图统一放在 `assets/previews/`
- 文件名采用英文短横线
- 首发阶段优先使用轻量 SVG 封面占位图
- 真实生成图优先替换 `preview`，不要直接覆盖原始提示词
- 自己生成的真实效果图建议以 `-generated.png` 结尾，方便和占位图、参考图区分

## 来源规范

- 有明确公开页面时，直接放原始链接
- 自己整理出来的通用写法，写 `self-curated`
- 若只是“灵感参考”而非原文转载，在正文里注明“inspired by”
- 如果是别人发来的纯提示词、但没有原始链接，写清楚来源说明，不要伪造链接

## 效果图来源规范

每张卡片如果声明了 `preview`，必须同时声明：

- `preview_type`
- `preview_source`

`preview_type` 只能使用下面 4 种：

- `generated`：自己用这条提示词生成的效果图，可直接放入仓库
- `reference`：外部参考图，只建议放链接，不建议下载进仓库
- `licensed`：明确授权可复用的图片，需要标注授权来源
- `placeholder`：占位预览图，用于说明大致布局或视觉方向

推荐写法：

```yaml
status: polished
preview: ../../assets/previews/example-preview.png
preview_type: generated
preview_source: generated from this prompt
```

外部图片如果没有明确授权，不要直接放进 `assets/previews/`。可以在卡片正文里写来源链接，等后续自己生成真实效果图后再替换。
