# 轻量展示站原型

这是 v2.0 展示站的第一版静态原型。

它不引入额外框架，直接读取仓库根目录的 `site-data/*.json`：

- `../site-data/prompts.json`
- `../site-data/scenes.json`
- `../site-data/tags.json`
- `../site-data/summary.json`

## 本地预览

建议从仓库根目录启动一个静态服务：

```bash
npm run site:preview
```

然后打开：

```text
http://localhost:4173/site/
```

## 当前能力

- 首页精选卡片
- 场景筛选
- 标签筛选
- 关键词搜索
- 卡片详情抽屉
- 一键复制提示词

后续如果升级到 Astro，可以继续沿用 `site-data/` 作为唯一数据入口。
