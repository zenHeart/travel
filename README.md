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

- **自定义域名**: <https://travel.zenheart.site/>

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

## 游记与城市

`content/trip/<行程 ID>/README.md` 是一篇游记的入口。一个行程可以覆盖多个城市；每个城市用同目录的 `<city>.md` 表示。单城市游记直接在 `README.md` 写全文。日期确切时，目录以 `YYYY-MM-DD-` 开头；只知道年份时用 `YYYY-`，只知道月日或日期未定时用 `undated-`。愿望清单也作为 `status: wishlist` 的未定日期行程。

```text
content/trip/
├── 2026-09-25-zhuhai-hongkong-guangzhou/
│   ├── README.md       # 行程总览、准备事项
│   ├── zhuhai.md       # 城市行程与地图点位
│   ├── hongkong.md
│   └── guangzhou.md
└── undated-aershan/
    └── README.md       # 单城市、未定日期行程

content/place/wuhan/
├── README.md           # 常驻地生活清单
└── tenglv-card/items.yaml
```

游记入口示例：

```markdown
---
type: trip
title: 珠海 → 香港 → 广州
status: planned
start_date: "2026-09-25"
---

# 行程总览

- [珠海](./zhuhai.md)
```

城市分页示例：

```markdown
---
type: city
chinese_name: 珠海
coordinates: [113.5767, 22.2707]
order: 1
---

# 珠海
```

单城市游记把 `chinese_name` 和 `coordinates` 加在 `README.md` 的 frontmatter 中，即可生成地图点位。其他附录页使用 `type: note`，不生成点位。页面路径为 `#/<行程 ID>/index` 和 `#/<行程 ID>/<城市文件名>`；地图点位直达相应城市页。图片放在游记目录并用 `./图片名` 引用。提交前执行 `pnpm audit-content` 与 `pnpm build`。

`start_date` 只记录能确认的完整出发日期；仅知道出行年份时用 `start_year`。旧笔记只有月日或只有首次提交时间时，用 `date_hint` 展示线索、`first_committed_on` 记录 Git 首次入库时间；它们不等同于旅行日期，也不会被当作已确认年份排序。经用户确认的年份和日期用 `date_source: user-confirmed` 标明来源。

武汉属于常驻地，使用 `type: place` 放在 `content/place/wuhan/`，不计入游记时间轴或心愿。首页和地图进入 `#/place/wuhan/index`；腾旅卡数据与页面属于武汉，路径为 `#/place/wuhan/tenglv`。

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
