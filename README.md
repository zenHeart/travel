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
│       ├── visited/     # 已访问城市
│       ├── planned/     # 计划中城市（可选）
│       └── wishlist/    # 愿望清单城市
├── src/             # 源代码
│   ├── components/  # React 组件
│   ├── pages/       # 页面组件
│   └── utils/       # 工具函数
├── public/          # 静态资源
└── dist/            # 构建输出
```

## 如何添加新城市

### 1. 创建城市目录

根据城市状态在对应目录下创建新文件夹：

```bash
# 已访问城市
mkdir -p content/cities/visited/cityname

# 计划中城市
mkdir -p content/cities/planned/cityname

# 愿望清单城市
mkdir -p content/cities/wishlist/cityname
```

### 2. 创建 index.md 文件

在城市目录下创建 `index.md` 文件，必须包含 YAML frontmatter：

```markdown
---
chinese_name: 北京 # 必需：中文名称
english_name: Beijing # 必需：英文名称
coordinates: [116.4074, 39.9042] # 必需：经纬度坐标 [经度, 纬度]
status: visited # 必需：城市状态 visited/planned/wishlist
visit_date: 2024-01-15 # 可选：访问日期
duration: 5天4夜 # 可选：行程时长
tags: [首都, 历史, 文化] # 可选：标签数组
title: 北京之旅 # 可选：页面标题
date: 2025-07-28 # 可选：创建日期
layout: blog # 可选：布局类型
---

# 北京

## 行程安排

### 第一天

- 天安门广场
- 故宫博物院

### 第二天

- 长城一日游

## 美食推荐

- 北京烤鸭
- 炸酱面

## 交通

- 地铁：方便快捷
- 出租车：较贵但舒适
```

### 3. 添加相关文件（可选）

可以在城市目录下添加更多文件：

```bash
# 详细攻略
touch content/cities/visited/cityname/detail.md

# 美食攻略
touch content/cities/visited/cityname/food.md

# 添加图片
cp photo.jpg content/cities/visited/cityname/
```

### 4. 预览效果

启动开发服务器查看效果：

```bash
pnpm dev
```

访问 `http://localhost:5173` 查看新添加的城市是否正确显示在地图上。

### 注意事项

1. **必需字段**: `chinese_name`、`english_name`、`coordinates` 和 `status` 是必需的
2. **坐标格式**: 坐标必须是数组格式 `[经度, 纬度]`，可以通过高德地图等工具获取
3. **目录名**: 目录名应使用英文小写，建议与 `english_name` 对应但简化
4. **状态一致性**: frontmatter 中的 `status` 应与目录位置一致
5. **图片路径**: 在 markdown 中使用相对路径引用图片，如 `![描述](./photo.jpg)`

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
