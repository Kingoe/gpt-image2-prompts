# P4 / P5 剩余效果图生成批次

这一批用于把正式卡片从 `40/60` 张真实生成效果图推进到 `60/60`。建议先做 P4，再做 P5。

## 执行规则

- 每张图优先使用卡片里的完整提示词。
- 生成完成后保存到 `assets/previews/` 中的建议目标路径。
- 保存后运行 `npm run preview:apply -- <card> <image>` 回填卡片。
- 如果首版不满意，保留为 `-generated-v2.png`，不要覆盖已经可用的图片。
- 地图、流程、长图、UI 类图片回填前必须人工检查文字和结构。

## P4：高复用场景

| 序号 | 卡片 | 建议比例 | 目标路径 |
| --- | --- | --- | --- |
| 01 | `library/social-avatar/clay-style-profile.md` | 1:1 | `assets/previews/clay-style-profile-generated.png` |
| 02 | `library/social-avatar/studio-founder-portrait.md` | 4:5 | `assets/previews/studio-founder-portrait-generated.png` |
| 03 | `library/poster-cover/festival-sale-poster.md` | 9:16 | `assets/previews/festival-sale-poster-generated.png` |
| 04 | `library/poster-cover/minimal-album-cover.md` | 1:1 | `assets/previews/minimal-album-cover-generated.png` |
| 05 | `library/social-media-post/cafe-hopping-route-poster.md` | 9:16 | `assets/previews/cafe-hopping-route-poster-generated.png` |
| 06 | `library/social-media-post/nostalgic-disposable-camera-snapshot.md` | 4:5 | `assets/previews/nostalgic-disposable-camera-snapshot-generated.png` |
| 07 | `library/social-media-post/product-inspired-fashion-editorial.md` | 4:5 | `assets/previews/product-inspired-fashion-editorial-generated.png` |
| 08 | `library/social-media-post/travel-packing-checklist-card.md` | 9:16 | `assets/previews/travel-packing-checklist-card-generated.png` |
| 09 | `library/xiaohongshu-cover/budget-breakdown-cover.md` | 3:4 | `assets/previews/budget-breakdown-cover-generated.png` |
| 10 | `library/xiaohongshu-cover/handwritten-note-knowledge-cover.md` | 3:4 | `assets/previews/handwritten-note-knowledge-cover-generated.png` |

## P5：结构化与实验内容

| 序号 | 卡片 | 建议比例 | 目标路径 |
| --- | --- | --- | --- |
| 11 | `library/explainer-visual/feature-workflow-collage.md` | 4:5 | `assets/previews/feature-workflow-collage-generated.png` |
| 12 | `library/explainer-visual/floorplan-to-3d-render.md` | 4:5 | `assets/previews/floorplan-to-3d-render-generated.png` |
| 13 | `library/ui-app-mockup/dark-glass-product-ui-concept.md` | 16:9 | `assets/previews/dark-glass-product-ui-concept-generated.png` |
| 14 | `library/ui-app-mockup/mobile-onboarding-screen-flow.md` | 4:5 | `assets/previews/mobile-onboarding-screen-flow-generated.png` |
| 15 | `library/wechat-article-visual/annual-trend-long-card.md` | 9:16 | `assets/previews/annual-trend-long-card-generated.png` |
| 16 | `library/wechat-article-visual/process-breakdown-long-graphic.md` | 9:16 | `assets/previews/process-breakdown-long-graphic-generated.png` |
| 17 | `library/wechat-article-visual/quote-driven-editorial-card.md` | 4:5 | `assets/previews/quote-driven-editorial-card-generated.png` |
| 18 | `library/wechat-article-visual/vertical-knowledge-long-card.md` | 9:16 | `assets/previews/vertical-knowledge-long-card-generated.png` |
| 19 | `library/brand-visual-lab/brand-sticker-sheet.md` | 1:1 | `assets/previews/brand-sticker-sheet-generated.png` |
| 20 | `library/brand-visual-lab/pop-up-store-concept-scene.md` | 16:9 | `assets/previews/pop-up-store-concept-scene-generated.png` |

## 验收

- `npm test`
- `npm run validate`
- `preview-requests/backlog.md` 中 P4/P5 状态更新为 `generated`
