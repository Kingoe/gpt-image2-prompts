# 首批真实效果图生成清单

这份清单用于把占位预览逐步替换成真实生成效果图。推荐先做 `5` 张：首页最容易被看见，视觉风格也覆盖得比较开。

## 使用流程

1. 打开对应提示词卡片，复制完整 `提示词`。
2. 按本清单里的“生成补充要求”补一句，避免生成图里出现来源站、水印或不可控文字。
3. 生成图片后，保存到指定 `目标路径`。
4. 运行对应 `回填命令`，脚本会自动更新卡片里的 `preview`、`preview_type`、`preview_source` 和正文预览图。
5. 运行 `npm test` 与 `npm run validate`，确认仓库结构仍然可发布。

> 注意：外部网站效果图除非明确授权，否则不要直接下载进仓库。这个目录只管理“我们要自己生成的图”。

## 01. VR 头显爆炸视图

- 卡片：`library/product-showcase/vr-headset-exploded-view.md`
- 目标路径：`assets/previews/vr-headset-exploded-generated.png`
- 建议比例：`16:9`
- 生成补充要求：`Generate a clean original preview image, no watermark, no brand logo, no unreadable labels, no copied reference layout.`
- 回填命令：

```bash
npm run preview:apply -- library/product-showcase/vr-headset-exploded-view.md assets/previews/vr-headset-exploded-generated.png
```

## 02. 收藏级手办盒装图

- 卡片：`library/product-showcase/collectible-box-packshot.md`
- 目标路径：`assets/previews/collectible-box-generated.png`
- 建议比例：`4:5`
- 生成补充要求：`Create an original premium collectible box packshot with clean studio lighting, no real brand marks, no watermark.`
- 回填命令：

```bash
npm run preview:apply -- library/product-showcase/collectible-box-packshot.md assets/previews/collectible-box-generated.png
```

## 03. 霓虹科技人像头像

- 卡片：`library/social-avatar/neon-tech-avatar.md`
- 目标路径：`assets/previews/neon-tech-avatar-generated.png`
- 建议比例：`1:1`
- 生成补充要求：`Create an original avatar preview, fictional person only, no celebrity likeness, no watermark, crisp face detail.`
- 回填命令：

```bash
npm run preview:apply -- library/social-avatar/neon-tech-avatar.md assets/previews/neon-tech-avatar-generated.png
```

## 04. 五一旅行美食推荐海报

- 卡片：`library/social-media-post/may-day-travel-food-guide-poster.md`
- 目标路径：`assets/previews/may-day-travel-food-guide-poster-generated.png`
- 建议比例：`9:16`
- 推荐变量：`广州`
- 生成补充要求：`Use Guangzhou as the destination. Keep text minimal and legible. If Chinese text is uncertain, use clean title blocks and food names only. No watermark.`
- 回填命令：

```bash
npm run preview:apply -- library/social-media-post/may-day-travel-food-guide-poster.md assets/previews/may-day-travel-food-guide-poster-generated.png
```

## 05. SaaS 仪表盘官网首屏图

- 卡片：`library/ui-app-mockup/saas-dashboard-hero-mockup.md`
- 目标路径：`assets/previews/saas-dashboard-hero-generated.png`
- 建议比例：`16:9`
- 生成补充要求：`Create an original SaaS landing hero mockup with fictional UI data, no real company logo, no watermark, clean dashboard details.`
- 回填命令：

```bash
npm run preview:apply -- library/ui-app-mockup/saas-dashboard-hero-mockup.md assets/previews/saas-dashboard-hero-generated.png
```

## 批量检查

全部回填后运行：

```bash
npm test
npm run validate
```
