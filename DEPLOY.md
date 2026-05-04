# 自有服务器部署指南

这个项目推荐部署到独立路径，避免和同域名下的其他项目冲突。

当前建议路径：

```text
https://kingoecode.com/prompt-atlas/
```

你的现有项目可以继续使用：

```text
https://kingoecode.com/ai-daily/
```

## 构建

默认构建前缀是 `/prompt-atlas/`：

```bash
npm run export:site-data
npm run build:site
```

构建产物会输出到：

```text
dist/
```

如果后续想换路径，可以指定：

```bash
BASE_PATH=/gpt-image-prompts/ npm run build:site
```

## 本地预览构建产物

```bash
npm run site:preview:dist
```

然后打开：

```text
http://127.0.0.1:4173/prompt-atlas/
```

## 服务器目录建议

```text
/var/www/
├── ai-daily/
└── prompt-atlas/
```

把 `dist/` 里的内容同步到：

```text
/var/www/prompt-atlas/
```

## Nginx 示例

```nginx
server {
    server_name kingoecode.com;

    location /ai-daily/ {
        alias /var/www/ai-daily/;
        try_files $uri $uri/ /ai-daily/index.html;
    }

    location /prompt-atlas/ {
        alias /var/www/prompt-atlas/;
        try_files $uri $uri/ /prompt-atlas/index.html;
    }
}
```

## Caddy 示例

```caddyfile
kingoecode.com {
    handle_path /ai-daily/* {
        root * /var/www/ai-daily
        file_server
    }

    handle_path /prompt-atlas/* {
        root * /var/www/prompt-atlas
        file_server
        try_files {path} /index.html
    }
}
```

## 手动同步示例

```bash
rsync -avz --delete dist/ user@server:/var/www/prompt-atlas/
```

## 每次发布前检查

```bash
npm test
npm run validate
npm run build:site
```

`dist/` 是构建产物，不提交到 Git。服务器只需要部署 `dist/` 内容。
