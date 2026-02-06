# GitHub Pages 部署指南

## 首次部署（需在 GitHub 上操作一次）

打开仓库 → **Settings** → 左侧菜单 **Pages** → **Build and deployment** 区域：

- **Source** 下拉框选择 **GitHub Actions**（默认是 "Deploy from a branch"，必须改）

改完后无需其他配置，后续推送代码会自动触发部署。

## 自动部署流程

项目已配置 GitHub Actions 工作流（`.github/workflows/deploy.yml`）：

- **触发条件**：每次向 `master` 分支推送代码
- **构建过程**：`npm ci` → `npm run build` → 部署 `dist/` 到 GitHub Pages
- **部署地址**：`https://huatuo-dr.github.io/3DMinesweeperClaude/`

推送代码后，可在仓库的 **Actions** 标签页查看构建进度，通常 1-2 分钟完成。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 本地构建
npm run build

# 预览构建结果
npm run preview
```

## 注意事项

- `vite.config.js` 中 `base` 设置为 `/3DMinesweeperClaude/`，与仓库名一致
- 如果更改仓库名，需同步修改 `base` 配置
- 构建产物在 `dist/` 目录，已在 `.gitignore` 中忽略
