# 旅行地图

一个基于 React + Vite 的旅行地图应用，记录我的旅行足迹。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env.local

# 编辑配置文件，填入你的高德地图API密钥
vim .env.local
```

### 3. 本地开发

```bash
pnpm dev
```

### 4. 构建和部署

```bash
# 构建项目
pnpm build

# 预览构建结果
pnpm preview

# 部署到 GitHub Pages
pnpm deploy
```

## 环境要求

- **Node.js**: 23.x 或更高版本
- **pnpm**: 10.8.1 或更高版本

## 部署配置

### GitHub Secrets

在 GitHub 仓库设置中配置以下 Secrets：

- `AMAP_API_KEY`: 高德地图 API 密钥
- `AMAP_SECURITY_JS_CODE`: 高德地图安全密钥

### 访问地址

部署完成后可通过以下地址访问：

- **GitHub Pages**: <https://zenheart.github.io/travel/>
- **自定义域名**: <https://blog.zenheart.site/travel/>

## 开发命令

```bash
# 开发服务器
pnpm dev

# 构建项目
pnpm build

# 预览构建结果
pnpm preview

# 代码检查
pnpm lint

# 安全检查
pnpm check-security

# 部署相关
pnpm deploy:check    # 仅检查
pnpm deploy:preview  # 构建并预览
pnpm deploy:all      # 完整部署流程
```

## 项目结构

```
travel/
├── content/          # 旅行内容
│   └── cities/      # 城市数据
├── src/             # 源代码
│   ├── components/  # React 组件
│   ├── pages/       # 页面组件
│   └── utils/       # 工具函数
├── public/          # 静态资源
└── dist/            # 构建输出
```

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7.0
- **路由**: React Router DOM 7.7
- **样式**: Tailwind CSS 4.1.11
- **地图**: 高德地图 API
- **部署**: GitHub Pages
- **包管理**: pnpm 10.8.1
- **Node.js**: 23.x

## 许可证

MIT License
