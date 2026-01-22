# GitHub Pages 配置指南

## 🚨 问题：404 错误原因

GitHub Pages 显示 404 是因为 **GitHub Pages 功能尚未在仓库中启用**。

---

## ✅ 解决方案：启用 GitHub Pages

### 步骤 1：进入仓库设置

1. 打开浏览器，访问：
   ```
   https://github.com/apple-666/Vietnam_tour/settings/pages
   ```

   或者：
   ```
   1. 访问 https://github.com/apple-666/Vietnam_tour
   2. 点击 "Settings"（设置）
   3. 左侧菜单找到 "Pages"
   ```

### 步骤 2：配置 GitHub Pages

在 "Source" 部分：

1. **Source**（源）：选择 `Deploy from a branch`
2. **Branch**（分支）：
   - 选择 `main` 分支
   - 文件夹选择 `/ (root)` 或 `/docs`

**推荐配置**：
```
Source: Deploy from a branch
Branch: main /docs
```

### 步骤 3：保存配置

点击 **"Save"** 按钮

### 步骤 4：等待部署

GitHub Pages 开始部署，通常需要 **1-5 分钟**

页面会显示：
```
🔄 Deploying...
```

部署完成后会显示：
```
✅ Your site is live at https://apple-666.github.io/Vietnam_tour/
```

---

## 📁 重要：正确的访问路径

### 如果选择 `/docs` 文件夹：
访问地址：
```
https://apple-666.github.io/Vietnam_tour/
```
这会自动显示 `docs/index.html`

### 如果选择 `/ (root)` 文件夹：
访问地址：
```
https://apple-666.github.io/Vietnam_tour/docs/index.html
```

---

## 🧪 验证部署

部署完成后，在浏览器访问：

### 方法 1：直接访问主页面
```
https://apple-666.github.io/Vietnam_tour/
```

### 方法 2：访问完整路径
```
https://apple-666.github.io/Vietnam_tour/docs/index.html
```

### 方法 3：访问离线测试页面
```
https://apple-666.github.io/Vietnam_tour/docs/offline_test.html
```

---

## ⚠️ 常见问题

### Q1: 显示 404 Not Found

**原因**：GitHub Pages 未启用或还在部署中

**解决**：
1. 检查 GitHub 仓库的 Settings > Pages
2. 确认已启用并保存
3. 等待 5-10 分钟后重试

### Q2: 显示 404 但 Pages 已启用

**原因**：文件路径错误

**解决**：
- 如果 Source 选择 `/docs`：访问 `https://apple-666.github.io/Vietnam_tour/`
- 如果 Source 选择 `/ (root)`：访问 `https://apple-666.github.io/Vietnam_tour/docs/index.html`

### Q3: 部署失败

**原因**：可能是构建错误

**解决**：
1. 检查 Pages 页面的 "Deployment" 日志
2. 确认 `docs/index.html` 文件存在
3. 确认仓库是公开的（private repo 需要 GitHub Pro）

---

## 🔍 检查部署状态

在仓库页面查看部署日志：

1. 访问：https://github.com/apple-666/Vietnam_tour
2. 点击 "Actions" 标签
3. 查看 "pages" 工作流的运行状态

---

## 🚀 快速启用步骤总结

1. 访问：https://github.com/apple-666/Vietnam_tour/settings/pages
2. Source: `Deploy from a branch`
3. Branch: `main` → `/docs`
4. 点击 "Save"
5. 等待 5 分钟
6. 访问：https://apple-666.github.io/Vietnam_tour/

---

## 📱 Android 端访问

启用后，Android 设备上访问：

```
https://apple-666.github.io/Vietnam_tour/
```

或完整路径：

```
https://apple-666.github.io/Vietnam_tour/docs/index.html
```

---

**现在请按照上述步骤在 GitHub 上启用 Pages，然后等待 5-10 分钟再次访问。**
