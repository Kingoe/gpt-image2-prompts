# 待配图清单

这份清单用于安排真实效果图生成优先级。原则是先补首页精选，再补高传播场景，最后补实验型内容。

## 当前状态

- 已有真实生成效果图：`6` 条
- v1.1 目标：至少 `20` 条卡片有真实生成效果图
- v1.3 目标：至少 `30` 条卡片有真实生成效果图

## P0：首页精选优先

这些卡片已经在 README 精选区出现，优先把占位图替换为真实生成图。

| 优先级 | 卡片 | 当前状态 | 建议目标路径 |
| --- | --- | --- | --- |
| P0 | `library/poster-cover/cinematic-character-poster.md` | `placeholder` | `assets/previews/cinematic-character-poster-generated.png` |
| P0 | `library/explainer-visual/japanese-style-infographic.md` | `placeholder` | `assets/previews/japanese-infographic-generated.png` |
| P0 | `library/social-media-post/liquid-glass-bento-product-post.md` | `placeholder` | `assets/previews/liquid-glass-bento-generated.png` |
| P0 | `library/youtube-thumbnail/ai-tool-vs-human-thumbnail.md` | `placeholder` | `assets/previews/ai-tool-vs-human-generated.png` |
| P0 | `library/ecommerce-banner/festival-campaign-hero-banner.md` | `placeholder` | `assets/previews/festival-campaign-banner-generated.png` |
| P0 | `library/logo-ip-mascot/rounded-mascot-badge-system.md` | `placeholder` | `assets/previews/mascot-badge-generated.png` |

## P1：高传播内容补齐

这些内容适合对外传播，补图后更容易提升仓库观感。

| 优先级 | 卡片 | 建议目标路径 |
| --- | --- | --- |
| P1 | `library/xiaohongshu-cover/viral-checklist-cover.md` | `assets/previews/viral-checklist-cover-generated.png` |
| P1 | `library/xiaohongshu-cover/before-after-contrast-cover.md` | `assets/previews/before-after-contrast-cover-generated.png` |
| P1 | `library/xiaohongshu-cover/desk-flatlay-tutorial-cover.md` | `assets/previews/desk-flatlay-tutorial-cover-generated.png` |
| P1 | `library/wechat-article-visual/editorial-wechat-hero-cover.md` | `assets/previews/editorial-wechat-hero-generated.png` |
| P1 | `library/social-media-post/chalkboard-ai-news-summary.md` | `assets/previews/chalkboard-ai-news-summary-generated.png` |
| P1 | `library/social-media-post/mathematical-visualization-infographic.md` | `assets/previews/mathematical-visualization-generated.png` |
| P1 | `library/youtube-thumbnail/dramatic-before-after-thumbnail.md` | `assets/previews/dramatic-before-after-thumbnail-generated.png` |
| P1 | `library/youtube-thumbnail/shocked-reaction-tech-breakdown-thumbnail.md` | `assets/previews/shocked-reaction-tech-breakdown-generated.png` |

## P2：商业与产品视觉

这些内容适合做案例感和商业可用性的展示。

| 优先级 | 卡片 | 建议目标路径 |
| --- | --- | --- |
| P2 | `library/product-showcase/transparent-perfume-packshot.md` | `assets/previews/transparent-perfume-packshot-generated.png` |
| P2 | `library/ecommerce-banner/luxury-single-product-banner.md` | `assets/previews/luxury-single-product-banner-generated.png` |
| P2 | `library/ecommerce-banner/gift-box-celebration-banner.md` | `assets/previews/gift-box-celebration-banner-generated.png` |
| P2 | `library/ecommerce-banner/feature-zone-detail-banner.md` | `assets/previews/feature-zone-detail-banner-generated.png` |
| P2 | `library/ui-app-mockup/mobile-app-screen-stack.md` | `assets/previews/mobile-app-screen-stack-generated.png` |
| P2 | `library/ui-app-mockup/feature-split-landing-visual.md` | `assets/previews/feature-split-landing-visual-generated.png` |

## P3：品牌/IP 与实验型内容

这些适合在内容厚度起来后逐步补齐。

| 优先级 | 卡片 | 建议目标路径 |
| --- | --- | --- |
| P3 | `library/logo-ip-mascot/brand-mascot-3d-turnaround.md` | `assets/previews/brand-mascot-3d-turnaround-generated.png` |
| P3 | `library/logo-ip-mascot/mascot-expression-sheet.md` | `assets/previews/mascot-expression-sheet-generated.png` |
| P3 | `library/logo-ip-mascot/object-inspired-logo-visual.md` | `assets/previews/object-inspired-logo-visual-generated.png` |
| P3 | `library/brand-visual-lab/candid-convenience-store-scene.md` | `assets/previews/candid-convenience-store-scene-generated.png` |
| P3 | `library/brand-visual-lab/cozy-ai-art-studio-collaboration.md` | `assets/previews/cozy-ai-art-studio-collaboration-generated.png` |
| P3 | `library/brand-visual-lab/cinematic-coffee-shop-vn-ui-mockup.md` | `assets/previews/cinematic-coffee-shop-vn-ui-generated.png` |

## 回填方式

生成图片并保存到目标路径后，运行：

```bash
npm run preview:apply -- library/scene/card.md assets/previews/card-generated.png
```

然后验证：

```bash
npm test
npm run validate
```
