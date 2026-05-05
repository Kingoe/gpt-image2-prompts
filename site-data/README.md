# 站点数据导出

这个目录是 v2.0 轻量展示站的数据层。

数据来源仍然是 `library/` 里的 Markdown 卡片。运行下面命令会自动导出网站可直接读取的 JSON：

```bash
npm run export:site-data
```

导出文件：

- `prompts.json`：完整提示词卡片列表，适合首页瀑布流、搜索页和详情页使用
- `scenes.json`：按使用场景聚合，适合场景列表页和 `/scenes/<slug>/` 静态页使用
- `tags.json`：按效果标签聚合，适合标签索引页和 `/tags/<slug>/` 静态页使用
- `summary.json`：总量统计，适合首页指标区使用

校验命令：

```bash
npm run export:site-data:check
```

后续接入 Astro 时，建议继续让 Markdown 作为唯一内容源，站点只读取这里的 JSON，不在页面层重复解析 Markdown。
