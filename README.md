# GPT Image 2 提示词收录库

一个专门收录 `GPT Image 2` 高价值提示词的仓库。

线上访问：[https://kingoecode.com/prompt-atlas/](https://kingoecode.com/prompt-atlas/)

这里不只是在堆提示词，而是在整理一套真正方便复用的素材库：
- 先看效果
- 再看适用场景
- 最后直接复制提示词或继续改写

> 适合自己收藏，也适合公开传播。

## 这是什么

这个仓库把分散在网页、社群、截图、聊天记录里的好提示词，整理成可长期积累的卡片库。

你可以在这里快速找到：
- 想做什么图，用哪类提示词
- 同一种视觉风格，有哪些可复用写法
- 只有“纯提示词”时，怎么规范入库
- 先看效果预览，再决定要不要拿走提示词

## 一眼看懂

| 指标 | 当前内容 |
| --- | --- |
| 提示词卡片 | `61` 条 |
| 使用场景 | `12` 类 |
| 标签入口 | `119` 个结构化标签，首页展示高频标签 |
| 真实生成效果图 | `61` 条 |
| 质量状态 | `61` 条 polished / `0` 条 needs-preview |
| 复用说明 | `61` 条已补变量说明与生成注意事项，`16` 条首页精选已精修 |
| 收录方式 | `inbox 快速收集 + library 正式归档` |

## 从哪里开始

### 如果你想直接找灵感

- 逛线上版：[Prompt Atlas](https://kingoecode.com/prompt-atlas/)
- 看 [精选提示词](#精选提示词)
- 看 [按使用场景浏览](#按使用场景浏览)
- 看 [热门效果标签](#热门效果标签)

### 如果你想把外部提示词也收进来

- 快速收录说明：[inbox/README.md](inbox/README.md)
- 纯提示词模板：[templates/inbox-prompt-only-entry.md](templates/inbox-prompt-only-entry.md)
- 正式卡片模板：[templates/prompt-card.md](templates/prompt-card.md)
- 贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)
- 自动转正式卡片：`npm run import:prompt -- inbox/your-entry.md`
- 真实效果图回填：`npm run preview:apply -- library/scene/card.md assets/previews/card-generated.png`
- 首批生图清单：[preview-requests/first-batch.md](preview-requests/first-batch.md)

### 如果你第一次来到这个仓库

推荐按这个顺序逛：
1. 先看 `精选提示词`
2. 再按你的使用目的进入场景目录
3. 最后根据风格标签继续横向扩展

### 如果你想了解后续方向

- 项目路线图：[ROADMAP.md](ROADMAP.md)
- 待配图清单：[preview-requests/backlog.md](preview-requests/backlog.md)
- 剩余效果图批次：[preview-requests/remaining-batch.md](preview-requests/remaining-batch.md)
- v2.0 站点数据导出：[site-data/README.md](site-data/README.md)
- v2.0 静态展示站原型：[site/README.md](site/README.md)
- 自有服务器部署：[DEPLOY.md](DEPLOY.md)

## 精选提示词

下面这批卡片已经优先接入了效果预览，进入单条页面后可以先看图，再决定要不要拿走提示词。

| 预览 | 标题 | 适用场景 | 效果标签 |
| --- | --- | --- | --- |
| ![vr-headset](assets/previews/vr-headset-exploded-generated.png) | [VR 头显爆炸视图](library/product-showcase/vr-headset-exploded-view.md) | 产品展示图 | 爆炸视图 / 3D 渲染 |
| ![toy-box](assets/previews/collectible-box-generated.png) | [收藏级手办盒装图](library/product-showcase/collectible-box-packshot.md) | 产品展示图 | 盲盒包装 / 亚克力质感 |
| ![avatar](assets/previews/neon-tech-avatar-generated.png) | [霓虹科技人像头像](library/social-avatar/neon-tech-avatar.md) | 社媒头像 / 形象图 | 科技感 / 赛博光效 |
| ![poster](assets/previews/cinematic-character-poster-generated.png) | [电影级单人物海报](library/poster-cover/cinematic-character-poster.md) | 海报封面 | 电影海报感 / 戏剧灯光 |
| ![infographic](assets/previews/japanese-infographic-generated.png) | [日系信息图卡片](library/explainer-visual/japanese-style-infographic.md) | 说明示意图 | 信息图 / 日系排版 |
| ![bento](assets/previews/liquid-glass-bento-generated.png) | [液态玻璃 Bento 社媒图](library/social-media-post/liquid-glass-bento-product-post.md) | 社媒贴文 | Bento Grid / 液态玻璃 |
| ![food](assets/previews/may-day-travel-food-guide-poster-generated.png) | [五一旅行美食推荐海报](library/social-media-post/may-day-travel-food-guide-poster.md) | 社媒贴文 | 旅行美食 / 9比16海报 |
| ![map](assets/previews/beijing-travel-map-poster-generated.png) | [五一旅行景点推荐地图海报](library/social-media-post/may-day-travel-map-poster.md) | 社媒贴文 | 旅行地图 / 信息图 |
| ![thumb](assets/previews/ai-tool-vs-human-generated.png) | [AI 工具对比缩略图](library/youtube-thumbnail/ai-tool-vs-human-thumbnail.md) | YouTube 缩略图 | 强对比 / 夸张表情 |
| ![ecom](assets/previews/festival-campaign-banner-generated.png) | [大促氛围横幅图](library/ecommerce-banner/festival-campaign-hero-banner.md) | 电商详情页 / Banner 主视觉 | 大促氛围 / 横幅主视觉 |
| ![mascot](assets/previews/mascot-badge-generated.png) | [圆润吉祥物徽章图](library/logo-ip-mascot/rounded-mascot-badge-system.md) | LOGO / IP 角色 / 吉祥物视觉 | 吉祥物 / 徽章感 |
| ![ui](assets/previews/saas-dashboard-hero-generated.png) | [SaaS 仪表盘官网首屏图](library/ui-app-mockup/saas-dashboard-hero-mockup.md) | UI 截图 / App Mockup / Landing Page Visual | SaaS 官网 / 仪表盘 |
| ![cashier](assets/previews/candid-convenience-store-scene-generated.png) | [便利店抓拍叙事照](library/brand-visual-lab/candid-convenience-store-scene.md) | 品牌视觉实验 | 生活方式摄影 / 抓拍感 |
| ![xhs](assets/previews/viral-checklist-cover-generated.png) | [爆款清单型首图](library/xiaohongshu-cover/viral-checklist-cover.md) | 小红书封面 / 图文首图 | 清单感 / 高信息密度 |
| ![wechat](assets/previews/editorial-wechat-hero-generated.png) | [公众号长文头图](library/wechat-article-visual/editorial-wechat-hero-cover.md) | 公众号头图 / 长图知识卡 | 杂志感 / 标题空间 |
| ![ui2](assets/previews/mobile-app-screen-stack-generated.png) | [App 截图堆叠展示图](library/ui-app-mockup/mobile-app-screen-stack.md) | UI 截图 / App Mockup / Landing Page Visual | App 截图 / 设备样机 |

## 按使用场景浏览

| 场景 | 适合找什么 |
| --- | --- |
| [产品展示图](library/product-showcase/README.md) | 爆炸视图、包装图、单品主视觉 |
| [社媒头像 / 形象图](library/social-avatar/README.md) | 头像、人设图、个人品牌形象 |
| [海报封面](library/poster-cover/README.md) | 人物海报、活动主视觉、封面图 |
| [说明示意图](library/explainer-visual/README.md) | 信息图、流程图、结构说明图 |
| [社媒贴文](library/social-media-post/README.md) | 可收藏卡片、知识图、旅行海报 |
| [YouTube 缩略图](library/youtube-thumbnail/README.md) | 强点击视频封面、对比型缩略图 |
| [品牌视觉实验](library/brand-visual-lab/README.md) | 世界观、叙事摄影、概念提案 |
| [小红书封面 / 图文首图](library/xiaohongshu-cover/README.md) | 清单首图、教程封面、对比首图 |
| [公众号头图 / 长图知识卡](library/wechat-article-visual/README.md) | 长文头图、知识长图、引言卡片 |
| [电商详情页 / Banner 主视觉](library/ecommerce-banner/README.md) | 活动横幅、卖点图、礼盒主视觉 |
| [LOGO / IP 角色 / 吉祥物视觉](library/logo-ip-mascot/README.md) | 吉祥物、IP 角色、Logo 概念展示 |
| [UI 截图 / App Mockup / Landing Page Visual](library/ui-app-mockup/README.md) | 官网首屏、App 样机、产品截图 |

## 热门效果标签

### 高传播视觉

- [小红书封面](tags/xiaohongshu-cover.md)
- [YouTube 缩略图](tags/youtube-thumbnail.md)
- [公众号头图](tags/wechat-hero.md)
- [长图知识卡](tags/longform-knowledge-card.md)

### 品牌与商业

- [电商 Banner](tags/ecommerce-banner.md)
- [详情页卖点图](tags/detail-feature-banner.md)
- [品牌吉祥物](tags/brand-mascot.md)
- [Logo 视觉](tags/logo-visual.md)

### 视觉风格

- [爆炸视图](tags/exploded-view.md)
- [盲盒包装](tags/blind-box-packaging.md)
- [黏土风](tags/clay-style.md)
- [电影海报感](tags/cinematic-poster.md)
- [黑板手绘](tags/chalkboard-style.md)
- [Bento Grid](tags/bento-grid.md)

### 内容与界面

- [信息图](tags/infographic.md)
- [旅行地图](tags/travel-map.md)
- [数学可视化](tags/mathematical-visualization.md)
- [SaaS 官网视觉](tags/saas-landing-visual.md)
- [App 截图展示](tags/app-screen-mockup.md)
- [VN UI](tags/vn-ui.md)
- [3D 渲染](tags/3d-render.md)
- [生活方式摄影](tags/lifestyle-photography.md)
- [教程首图](tags/tutorial-cover.md)

## 最近新增

- 2026-09-01: 从 X 外部灵感整理 `1` 条「编辑摄影视觉诗海报」正式卡片，并接入用户生成的本地真实效果图。
- 2026-05-05: 同步文档状态和 README 精选预览，新增站点页脚版权/来源说明，并让场景与标签支持独立静态页面。
- 2026-05-05: 优化线上版分享体验，README 增加线上入口，站点补充 SEO/社交分享信息，并支持场景、标签、搜索和单张提示词直链。
- 2026-05-04: 增加自有服务器部署支持，默认路径前缀为 `/prompt-atlas/`，可构建 `dist/` 后部署到 `kingoecode.com/prompt-atlas/`。
- 2026-05-04: 新增 v2.0 静态展示站原型，支持读取 `site-data`、精选浏览、场景/标签筛选、搜索和一键复制提示词。
- 2026-05-04: 启动 v2.1 社区贡献机制，新增贡献指南、Issue 模板和 PR 模板，明确投稿、补图、标签建议与版权边界。
- 2026-05-04: 启动 v2.0 轻量展示站数据层，新增 `site-data/` JSON 导出，后续可供 Astro 首页、场景页、标签页和搜索页直接读取。
- 2026-05-04: 完成 P5 结构化与实验内容 `10` 张真实效果图，正式卡片真实生成图达到 `60/60`。
- 2026-05-04: 完成 P4 高复用场景 `10` 张真实效果图，真实生成图数量达到 `50` 条。
- 2026-05-04: 整理 P4 / P5 剩余 `20` 张真实效果图生成队列，为后续推进到 `60/60` 张效果图做准备。
- 2026-05-04: 精修首页 `16` 条精选卡片的变量说明和生成注意事项，让每条提示词更容易直接改写复用。
- 2026-05-04: 启动 v1.2 内容规范升级，为全部 `60` 条正式卡片补齐 `status`、变量说明和生成注意事项，并把状态规则写入模板与校验脚本。
- 2026-05-04: 补齐 P3 品牌/IP 与实验型内容 `6` 张真实效果图，真实生成图数量达到 `40` 条。
- 2026-05-03: 补齐 P2 商业与产品视觉全部 `10` 张真实效果图，真实生成图数量达到 `34` 条。
- 2026-05-03: 完成 P2 前 `6` 张商业与产品视觉效果图，真实生成图数量达到 `30` 条。
- 2026-05-03: 完成 P1 剩余 `4` 张真实效果图，真实生成图数量推进到 `24` 条。
- 2026-05-03: 完成 P1 第二批 `4` 张真实效果图，真实生成图数量达到 `20` 条。
- 2026-05-03: 为首页 P0 精选卡片补齐 `6` 张真实生成效果图，精选区占位预览清零。
- 2026-05-03: 新增 `15` 条 v1.1 高频场景提示词，内容总量达到 `60` 条。
- 2026-05-03: 新增项目路线图与待配图清单，明确 v1.1 到 v2.1 的后续推进路径。
- 2026-05-03: 新增 `1` 条旅行景点推荐地图海报，并接入北京示例真实效果图。
- 2026-05-03: 新增首批真实效果图生成清单与回填脚本，开始支持“生成后自动更新卡片”。
- 2026-05-03: 为精选卡片接入首批 `11` 条效果图预览，首页开始支持“先看图再取提示词”。
- 2026-05-03: 新增 `1` 条旅行美食海报示例，并补充“只有提示词时如何入库”的仓库规范。
- 2026-05-03: 新增 `4` 条 UI 截图 / App Mockup / Landing Page Visual，总量来到 `45` 条，扩展到 `12` 个使用场景。
- 2026-05-03: 新增 `4` 条 LOGO / IP 角色 / 吉祥物视觉。
- 2026-05-03: 新增 `4` 条电商详情页 / Banner 主视觉。
- 2026-05-03: 新增 `4` 条公众号头图 / 长图知识卡。
- 2026-05-03: 新增 `4` 条小红书封面卡片。

## 如何使用

1. 先从 `精选提示词` 找到最接近你目标的视觉方向。
2. 再进入对应的场景目录，筛到你真正要做的图。
3. 打开单条卡片，先看 `效果预览`，再复制提示词去改写。
4. 如果你从外部看到不错的提示词，先收进 [inbox](inbox/README.md)，后续再转正式卡片。

## 如何贡献

欢迎通过 Issue 或 Pull Request 一起补充高价值提示词。

- 只想分享提示词：使用 `投稿提示词` Issue 模板，贴出提示词、来源、场景和标签。
- 想请求补图：使用 `请求补效果图` Issue 模板，说明目标卡片和希望生成的方向。
- 想修标签或内容：使用 `标签建议` 或 `错误反馈` Issue 模板。
- 已经整理好卡片：按 [贡献指南](CONTRIBUTING.md) 提交 PR，并运行 `npm test` 和 `npm run validate`。

图片版权原则很简单：外部图没有明确授权时，不直接放进仓库；优先使用自己根据提示词生成的效果图。

## 收录原则

- 中文说明为主，方便整理和检索。
- 提示词正文优先保留英文，必要时混合中文描述。
- 每条内容尽量保留来源链接或明确标记为 `self-curated`。
- 首页只展示精选内容，完整库以分类目录和标签页为准。
- 只有纯提示词也可以正式收录，只要来源和适用场景足够清楚。
- 当前正式卡片已全部覆盖真实生成效果图，新增卡片会先标记为 `needs-preview`，再优先补齐本地生成预览。

## 仓库结构

```text
.
├── assets/
│   ├── covers/      # 封面缩略图
│   └── previews/    # 效果预览图
├── .github/         # Issue 模板与 PR 模板
├── inbox/           # 待整理候选区
├── library/         # 正式提示词库
├── preview-requests/# 真实效果图生成清单
├── ROADMAP.md       # 项目后续路线图
├── scripts/         # 仓库校验脚本与导入脚本
├── site/            # v2.0 轻量展示站原型
├── site-data/       # 展示站 JSON 数据
├── tags/            # 标签索引
├── templates/       # 卡片模板与收录规范
└── tests/           # 仓库结构测试
```
