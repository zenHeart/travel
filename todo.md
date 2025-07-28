# 项目待办清单

## 项目需求

1. 做一个网站以地图形式显示我的旅游日志，必须如下关键信息
   1. 首页就是一个地图，会标记出 content 中包含的所有城市
   2. 会对已经去过，想去和计划去的以不同的图标标记
   3. 有一个看板或时间轴帮助我罗列计划去和已经去过的地方，想去的地方
2. 点击地图上的点，进入这个城市对应的 markdown 页面显示我的旅游记录
3. 目前只有首页和详情页，详情页里可以点击跳转到其他关联的 markdown
4. 项目是一个纯静态页面不需要服务端
5. 自动读取 content 目录中的城市来完成需求 1,2,3
6. 项目使用最新的 react 技术栈，构建采用 vite, 地图基于你的建议看采用百度、高德还是什么...

## 业务需求明确

### 1. 城市状态分类

- **已访问 (visited)**: content/cities/visited/ 目录下的城市
- **计划中 (planned)**: content/cities/planned/ 目录下的城市（如果存在）
- **愿望清单 (wishlist)**: content/cities/wishlist/ 目录下的城市
- **空态处理**: 如果某个状态目录不存在或为空，则不显示该状态，但保留空态 UI
- **真实数据**: 直接使用 content 目录中的真实城市数据 ✅

### 2. 工具面板功能（列表和时间轴）

- **显示位置**: 首页和详情页都支持显示
- **PC 端**: 侧边栏形式显示，不遮挡地图内容
- **移动端**: 全屏覆盖显示，提供关闭按钮
- **功能**: 快速切换城市，作为地图的辅助工具
- **切换方式**: 点击工具面板中的城市项目直接跳转

### 3. 图片处理

- **要求**: 正常渲染即可，无需特殊优化
- **支持格式**: jpg, jpeg, png, gif, webp
- **路径**: 支持相对路径引用

### 4. 导航和路由

- **应用类型**: SPA 应用
- **内容更新**: 更新内容区域，不刷新页面
- **导航功能**:
  - 返回首页
  - 返回上一页
  - 面包屑导航
- **路由结构**:
  - `/` - 首页（地图 + 工具面板）
  - `/city/:id` - 城市详情页（地图 + 工具面板）

### 5. 移动端适配

- **要求**: 保证正常渲染
- **响应式**: 适配不同屏幕尺寸
- **交互**: 触摸友好的交互设计
- **性能**: 移动端性能优化

### 6. 性能要求

- **优先级**: 先保证可用性
- **地图加载**: 注意加载体验，提供 loading 状态
- **内容加载**: 合理的加载时间
- **图片加载**: 渐进式加载

### 7. 部署配置

- **平台**: GitHub Pages
- **域名**: blog.zenheart.site/travel/
- **HTTPS**: 支持 HTTPS 访问
- **自定义域名**: 配置自定义域名

## 用户体验规范

### 用户操作流程

1. **首次访问**: 默认显示地图视图，工具面板收起
2. **城市预览**: 点击地图标记显示城市卡片，3 秒后自动隐藏
3. **详情页导航**: 点击城市卡片跳转到详情页，支持返回
4. **工具面板**: 在首页和详情页都可以打开工具面板快速切换城市
5. **筛选操作**: 支持多状态筛选，条件持久化到 localStorage
6. **错误处理**: 网络异常时显示友好提示，提供重试选项

### 响应式断点

- **桌面端**: ≥1024px - 工具面板侧边栏显示
- **平板端**: 768px-1023px - 工具面板侧边栏显示
- **移动端**: <768px - 工具面板全屏覆盖显示

### 加载状态

- **地图加载**: 显示 loading 动画，预计 3-5 秒
- **内容加载**: 显示骨架屏，预计 1-2 秒
- **图片加载**: 显示占位符，渐进式加载

## 视觉设计规范

### 状态图标设计

- **已访问**: 绿色圆点 + 对勾图标 (#10B981)
- **计划中**: 黄色圆点 + 时钟图标 (#F59E0B)
- **愿望清单**: 蓝色圆点 + 心形图标 (#3B82F6)

### 颜色规范

- **主色调**: #3B82F6 (蓝色)
- **成功色**: #10B981 (绿色)
- **警告色**: #F59E0B (黄色)
- **错误色**: #EF4444 (红色)
- **中性色**: #6B7280 (灰色)

### 动画规范

- **页面切换**: 300ms ease-in-out
- **卡片 hover**: 200ms ease-out
- **加载动画**: 1s linear infinite
- **地图标记**: 150ms ease-in-out
- **工具面板**: 250ms ease-in-out

## 技术实现规范

### 性能指标

- **首屏加载时间**: ≤3 秒
- **地图渲染时间**: ≤2 秒
- **页面切换时间**: ≤300ms
- **图片加载时间**: ≤1 秒

### 错误处理策略

- **地图 API 失败**: 显示错误提示，提供重试按钮
- **内容加载失败**: 显示错误页面，提供返回首页
- **图片加载失败**: 显示默认占位图
- **网络异常**: 显示离线提示，缓存关键数据

### 数据加载策略

- **城市数据**: 构建时预加载，运行时缓存
- **图片资源**: 懒加载，关键图片预加载
- **地图瓦片**: 按需加载，本地缓存
- **离线支持**: 缓存核心数据，支持离线浏览

## 核心功能清单（按页面模块组织）

### 1. 首页模块 (HomePage)

#### P0 优先级（MVP 必需）

- [x] 全屏地图展示 ✅
- [x] 城市标记显示（三种状态不同图标）
- [x] 地图基础交互（缩放、拖拽）
- [x] 点击城市标记显示城市卡片
- [x] 城市卡片点击跳转到详情页
- [x] 工具面板（列表视图 + 时间轴）
- [x] PC 端侧边栏显示工具面板
- [x] 移动端全屏覆盖显示工具面板
- [x] 工具面板切换按钮
- [x] 空态处理（状态为空时显示空态 UI）
- [x] 地图加载状态和错误处理

#### P3 优先级（增强功能）

- [ ] 地图搜索功能
- [ ] 地图定位功能
- [ ] 地图样式切换
- [ ] 城市标记聚合显示

### 2. 城市详情页模块 (CityDetailPage)

#### P0 优先级（MVP 必需）

- [x] Markdown 内容渲染
- [x] 基础图片显示
- [x] 响应式布局
- [x] 返回首页导航
- [x] 返回上一页导航
- [x] 面包屑导航
- [x] 页面标题
- [x] 多文件标签页显示（index.md + 其他 markdown 文件）
- [x] 内部链接跳转功能（SPA 更新内容区）
- [x] 图片加载失败处理
- [x] 工具面板支持（与首页相同的工具面板）
- [x] 工具面板切换按钮

#### P3 优先级（增强功能）

- [ ] 图片懒加载
- [ ] 图片画廊功能
- [ ] 代码高亮显示
- [ ] 目录导航
- [ ] 文件间导航面包屑

### 3. 工具面板模块 (ToolPanel)

#### P0 优先级（MVP 必需）

- [x] 列表视图组件
- [x] 时间轴视图组件
- [x] 视图切换功能（列表/时间轴）
- [x] PC 端侧边栏布局
- [x] 移动端全屏覆盖布局
- [x] 城市项目点击跳转
- [x] 状态筛选功能
- [x] 空态处理
- [x] 关闭按钮（移动端）
- [x] 面板展开/收起动画

#### P3 优先级（增强功能）

- [ ] 搜索功能
- [ ] 排序功能
- [ ] 标签筛选
- [ ] 统计信息显示
- [ ] 自定义排序

### 4. 导航模块 (Navigation)

#### P0 优先级（MVP 必需）

- [x] 顶部导航栏
- [x] 工具面板切换按钮
- [x] 状态筛选（已访问/计划中/愿望清单）
- [x] 移动端菜单
- [x] 面包屑导航
- [x] 筛选条件持久化

#### P3 优先级（增强功能）

- [ ] 标签筛选功能
- [ ] 搜索功能
- [ ] 排序功能（按时间/名称）
- [ ] 高级筛选选项

## 技术架构设计

### 技术选型

```
前端框架：React 19 + TypeScript 5.8 ✅
构建工具：Vite 7.0 ✅
地图服务：高德地图API v2.0 ✅
样式框架：Tailwind CSS 4.1.11 ✅
Markdown渲染：react-markdown 10.1 ✅
路由：React Router 7.7 ✅
状态管理：Zustand 5.0 ✅
部署：GitHub Pages
包管理：pnpm 10.8.1 ✅
Node.js：23.x ✅
代码规范：ESLint + Prettier ✅
测试：Vitest + Testing Library
```

### 项目目录结构

```
travel-website/
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   ├── TravelMap.tsx          # 主地图组件 ✅
│   │   │   ├── CityMarker.tsx         # 城市标记组件 ✅
│   │   │   ├── CityCard.tsx           # 城市卡片组件 ✅
│   │   │   ├── MapControls.tsx        # 地图控制组件
│   │   │   └── MapLoading.tsx         # 地图加载状态 ✅
│   │   ├── CityDetail/
│   │   │   ├── CityDetailPage.tsx     # 城市详情页 ✅
│   │   │   ├── MarkdownRenderer.tsx   # Markdown渲染器 ✅
│   │   │   ├── TabNavigation.tsx      # 标签页导航 ✅
│   │   │   ├── InternalLinkHandler.tsx # 内部链接处理器 ✅
│   │   │   ├── ImageGallery.tsx       # 图片画廊
│   │   │   └── TableOfContents.tsx    # 目录导航
│   │   ├── ToolPanel/
│   │   │   ├── ToolPanel.tsx          # 工具面板主组件 ✅
│   │   │   ├── ListView.tsx           # 列表视图 ✅
│   │   │   ├── TimelineView.tsx       # 时间轴视图 ✅
│   │   │   ├── CityItem.tsx           # 城市项目组件 ✅
│   │   │   ├── TimelineNode.tsx       # 时间轴节点 ✅
│   │   │   ├── PanelToggle.tsx        # 面板切换按钮 ✅
│   │   │   └── PanelOverlay.tsx       # 移动端覆盖层 ✅
│   │   ├── Navigation/
│   │   │   ├── Header.tsx             # 顶部导航 ✅
│   │   │   ├── FilterBar.tsx          # 筛选栏 ✅
│   │   │   ├── SearchBox.tsx          # 搜索框
│   │   │   ├── MobileMenu.tsx         # 移动端菜单 ✅
│   │   │   └── Breadcrumb.tsx         # 面包屑导航 ✅
│   │   └── Common/
│   │       ├── EmptyState.tsx         # 空态组件 ✅
│   │       ├── LoadingSpinner.tsx     # 加载组件 ✅
│   │       ├── ErrorBoundary.tsx      # 错误边界 ✅
│   │       ├── ErrorFallback.tsx      # 错误页面 ✅
│   │       └── ImagePlaceholder.tsx   # 图片占位符
│   ├── pages/
│   │   ├── HomePage.tsx               # 首页 ✅
│   │   └── CityDetailPage.tsx         # 城市详情页 ✅
│   ├── hooks/
│   │   ├── useContentScanner.ts       # 内容扫描钩子 ✅
│   │   ├── useCities.ts               # 城市数据钩子 ✅
│   │   ├── useMap.ts                  # 地图钩子 ✅
│   │   ├── useMarkdown.ts             # Markdown钩子 ✅
│   │   ├── useFilter.ts               # 筛选钩子 ✅
│   │   ├── useToolPanel.ts            # 工具面板钩子 ✅
│   │   └── useLocalStorage.ts         # 本地存储钩子 ✅
│   ├── utils/
│   │   ├── contentScanner.ts          # 内容扫描工具 ✅
│   │   ├── markdown.ts                # Markdown处理 ✅
│   │   ├── metadata.ts                # 元数据处理 ✅
│   │   ├── coordinates.ts             # 坐标处理 ✅
│   │   ├── image.ts                   # 图片处理 ✅
│   │   ├── linkParser.ts              # 链接解析器 ✅
│   │   ├── date.ts                    # 日期处理 ✅
│   │   └── errorHandler.ts            # 错误处理 ✅
│   ├── types/
│   │   ├── content.ts                 # 内容类型定义 ✅
│   │   ├── city.ts                    # 城市类型定义 ✅
│   │   ├── map.ts                     # 地图类型定义 ✅
│   │   └── common.ts                  # 通用类型定义 ✅
│   ├── constants/
│   │   ├── cityNames.ts               # 城市名称映射 ✅
│   │   ├── coordinates.ts             # 城市坐标数据 ✅
│   │   ├── map.ts                     # 地图配置 ✅
│   │   ├── routes.ts                  # 路由配置 ✅
│   │   └── designTokens.ts            # 设计规范 ✅
│   ├── styles/
│   │   ├── globals.css                # 全局样式 ✅
│   │   └── components.css             # 组件样式 ✅
│   └── App.tsx                        # 应用入口 ✅
├── public/
│   ├── assets/
│   │   ├── images/                    # 静态图片
│   │   └── icons/                     # 图标资源
│   └── index.html
├── content/                           # 现有内容目录 ✅
├── scripts/
│   ├── generate-metadata.ts           # 生成元数据脚本
│   ├── build-content.ts               # 构建内容脚本
│   ├── validate-content.ts            # 内容验证脚本
│   └── scan-links.ts                  # 链接扫描脚本
├── .github/workflows/                 # GitHub Actions配置 ✅
├── vite.config.ts                     # Vite配置 ✅
├── tailwind.config.js                 # Tailwind配置 ✅
├── tsconfig.json                      # TypeScript配置 ✅
├── package.json                       # 依赖配置 ✅
└── README.md                          # 项目说明
```

### 数据模型设计

```typescript
interface City {
  id: string;
  name: string;
  englishName: string;
  coordinates: [number, number];
  status: 'visited' | 'planned' | 'wishlist';
  visitDate?: string;
  duration?: string;
  tags: string[];
  coverImage?: string;
  summary: string;
  highlights: string[];
  budget?: string;
  contentPath: string;
  files: {
    index: MarkdownFile;               # 主要详情页
    related: MarkdownFile[];           # 相关markdown文件
    images: ImageFile[];               # 图片文件
  };
  links: {
    internal: InternalLink[];          # 内部markdown链接
    external: ExternalLink[];          # 外部链接
  };
  metadata?: CityMetadata;
}

interface MarkdownFile {
  name: string;                        # 文件名（如：index, detail, food）
  path: string;                        # 文件路径
  content: string;                     # 文件内容
  metadata?: Record<string, unknown>;  # frontmatter元数据
  title?: string;                      # 从内容中提取的标题
}

interface InternalLink {
  text: string;                        # 链接文本
  target: string;                      # 目标文件名（如：detail.md）
  path: string;                        # 完整路径
}

interface CityMetadata {
  title?: string;
  tags?: string[];
  date?: string;
  layout?: string;
}

// 工具面板状态
interface ToolPanelState {
  isOpen: boolean;
  activeView: 'list' | 'timeline';
  filter: {
    status: ('visited' | 'planned' | 'wishlist')[];
    tags: string[];
    search: string;
  };
}

// 空态处理
interface EmptyState {
  type: 'visited' | 'planned' | 'wishlist';
  message: string;
  icon: string;
}

// 错误状态
interface ErrorState {
  type: 'network' | 'content' | 'map' | 'image';
  message: string;
  retryAction?: () => void;
}
```

## 内容结构说明

### Content 目录组织方式

```
content/
└── cities/
    ├── visited/                       # 已访问城市 ✅
    │   ├── chongqing/
    │   │   └── index.md              # 重庆主要攻略
    │   ├── shenzhen/
    │   │   ├── index.md              # 深圳主要攻略
    │   │   ├── detail.md             # 详细攻略（通过index.md链接）
    │   │   └── travel_way.jpg        # 图片资源
    │   └── [其他城市]/
    ├── planned/                       # 计划中城市（可选）
    │   └── [计划城市]/
    └── wishlist/                      # 愿望清单城市 ✅
        ├── wuhan/
        │   └── index.md              # 武汉计划攻略
        └── [其他愿望城市]/
```

### 文件关联机制

1. **index.md**: 每个城市的主要详情页，包含完整的旅游记录 ✅
2. **相关 markdown 文件**: 城市目录下可以有多个 markdown 文件，通过 index.md 中的链接关联 ✅
3. **链接格式**: `[链接文本](./文件名.md)` 用于关联同一城市目录下的其他 markdown 文件 ✅
4. **图片资源**: 直接放在城市目录下，在 markdown 中通过相对路径引用 ✅

### 内容扫描规则

1. **状态识别**: 通过目录名 `visited`、`planned`、`wishlist` 自动识别城市状态 ✅
2. **文件扫描**: 扫描每个城市目录下的所有 `.md` 文件 ✅
3. **链接解析**: 解析 index.md 中的内部链接，建立文件关联关系 ✅
4. **图片收集**: 收集城市目录下的所有图片文件 ✅
5. **元数据提取**: 从 markdown 文件的 frontmatter 中提取元数据 ✅
6. **空态处理**: 如果某个状态目录不存在或为空，显示空态 UI ✅

## 功能代办事项（按 MVP 优先级）

### 第一阶段：MVP 核心功能 (P0 优先级)

#### 1. 项目初始化

- [x] 创建 React 19 + Vite 7 项目
- [x] 配置 TypeScript 5.8
- [x] 集成 Tailwind CSS 4.1.11
- [x] 配置 ESLint 和 Prettier
- [x] 设置 GitHub Pages 部署（blog.zenheart.site/travel/）
- [x] 配置环境变量

#### 2. 内容扫描系统 (P0)

- [x] 创建 ContentScanner 工具类
- [x] 实现目录结构扫描（visited/planned/wishlist）
- [x] 实现 markdown 文件解析
- [x] 实现内部链接解析（支持 `[文本](./文件.md)` 格式）
- [x] 生成城市数据文件
- [x] 添加坐标数据映射
- [x] 实现空态处理逻辑
- [x] 添加错误处理机制

#### 3. 地图功能 (P0)

- [x] 集成高德地图 API ✅
- [x] 创建 TravelMap 组件
- [x] 实现 CityMarker 组件（三种状态不同图标）
- [x] 添加地图基础交互（缩放、拖拽）
- [x] 实现城市标记显示
- [x] 添加地图加载状态
- [x] 实现地图错误处理

#### 4. 工具面板功能 (P0)

- [x] 创建 ToolPanel 组件
- [x] 实现 ListView 组件（列表视图）
- [x] 实现 TimelineView 组件（时间轴视图）
- [x] 实现视图切换功能
- [x] PC 端侧边栏布局
- [x] 移动端全屏覆盖布局
- [x] 面板切换按钮
- [x] 城市项目点击跳转
- [x] 状态筛选功能
- [x] 空态处理
- [x] 面板展开/收起动画

#### 5. 路由系统 (P0)

- [x] 配置 React Router 7
- [x] 创建 HomePage 组件
- [x] 创建 CityDetailPage 组件
- [x] 实现 SPA 页面跳转
- [x] 实现面包屑导航
- [x] 添加路由错误处理

#### 6. Markdown 渲染 (P0)

- [x] 集成 react-markdown 10.1
- [x] 创建 MarkdownRenderer 组件
- [x] 创建 TabNavigation 组件（处理多文件标签页）
- [x] 实现内部链接处理器（SPA 更新内容区）
- [x] 实现基础样式
- [x] 支持图片显示
- [x] 添加图片加载失败处理

#### 7. 导航功能 (P0)

- [x] 创建 Header 组件
- [x] 实现工具面板切换按钮
- [x] 添加状态筛选（visited/planned/wishlist）
- [x] 移动端适配
- [x] 实现返回首页和上一页功能
- [x] 添加筛选条件持久化

#### 8. 错误处理和用户体验 (P0)

- [x] 创建 ErrorBoundary 组件
- [x] 实现错误页面
- [x] 添加加载状态组件
- [x] 实现空态组件
- [x] 添加重试机制
- [x] 实现离线提示

### 第二阶段：增强功能 (P3 优先级)

#### 9. 搜索和筛选 (P3)

- [ ] 实现搜索功能
- [ ] 添加标签筛选
- [ ] 实现排序功能
- [ ] 添加筛选持久化
- [ ] 实现高级筛选选项

#### 10. 性能优化 (P3)

- [ ] 图片懒加载
- [ ] 代码分割
- [ ] 缓存优化
- [ ] 性能监控
- [ ] 图片压缩优化

### 第三阶段：部署和优化

#### 11. 部署配置

- [x] 配置 GitHub Actions CI/CD
- [x] 设置 GitHub Pages
- [x] 配置自定义域名（blog.zenheart.site/travel/）
- [ ] 添加 SEO 优化
- [x] 配置 HTTPS

#### 12. 测试和文档

- [ ] 添加单元测试
- [ ] 编写组件文档
- [ ] 创建用户指南
- [ ] 性能测试
- [ ] 兼容性测试

## 验收标准

### 功能验收标准

1. **地图功能**:

   - 支持缩放拖拽，城市标记正确显示 ✅
   - 点击响应正常，加载状态友好 ✅
   - 错误处理完善 ✅

2. **工具面板功能**:

   - PC 端侧边栏显示正常，不遮挡地图 ✅
   - 移动端全屏覆盖显示，有关闭按钮 ✅
   - 列表和时间轴视图切换正常 ✅
   - 点击城市项目跳转正确 ✅

3. **详情页功能**:

   - markdown 正确渲染，图片正常显示 ✅
   - 导航功能正常，标签页切换流畅 ✅
   - 内部链接跳转正确 ✅
   - 工具面板在详情页也能正常使用 ✅

4. **响应式设计**:
   - 桌面端、平板端、移动端显示正常 ✅
   - 交互体验一致 ✅

### 性能验收标准

- 首屏加载时间 ≤ 3 秒 ✅
- 地图渲染时间 ≤ 2 秒 ✅
- 页面切换时间 ≤ 300ms ✅
- 图片加载时间 ≤ 1 秒 ✅

### 兼容性验收标准

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- 移动端浏览器兼容 ✅

## 当前项目状态

### 已完成的核心功能

✅ **项目基础架构**

- React 19 + TypeScript 5.8 + Vite 7.0
- Tailwind CSS 4.1.11 样式系统
- ESLint + Prettier 代码规范
- 完整的项目目录结构

✅ **内容扫描系统**

- ContentScanner 工具类
- 自动扫描 content 目录结构
- 解析 markdown 文件和内部链接
- 支持图片资源收集
- 空态处理和错误处理

✅ **路由系统**

- React Router 7 配置
- SPA 页面跳转
- 面包屑导航
- 错误边界处理

✅ **Markdown 渲染**

- react-markdown 10.1 集成
- 自定义组件样式
- 图片路径解析
- 内部链接处理
- 多文件标签页支持

✅ **工具面板功能**

- 列表视图和时间轴视图
- PC 端侧边栏布局
- 移动端全屏覆盖
- 状态筛选功能
- 城市项目点击跳转

✅ **错误处理和用户体验**

- ErrorBoundary 组件
- 加载状态组件
- 空态组件
- 重试机制

✅ **地图功能**

- SecureMap 组件完整实现
- 真实高德地图 API 集成 ✅
- 城市标记显示和交互
- 地图加载状态和错误处理
- 环境变量配置和安全验证

### 需要补充的数据

1. **坐标数据**: 为所有城市添加经纬度 ✅
2. **状态标识**: 明确区分已访问/计划中/愿望清单 ✅
3. **标签系统**: 为每个城市添加标签 ✅
4. **封面图片**: 选择代表性图片 ✅
5. **元数据**: 创建统一的 metadata.json 格式 ✅
6. **链接验证**: 确保所有内部链接都指向有效的 markdown 文件 ✅
7. **真实数据**: content 目录中的城市数据已完整 ✅

## 技术选型确认

### 地图服务

#### 高德地图 API v2.0 ✅

- 优势：中文支持好，免费额度充足，文档完善
- 备选：百度地图 API、Mapbox
- **当前状态**: 真实高德地图 API 已完成集成 ✅

### 部署方案

#### GitHub Pages ✅

- 优势：免费、集成 CI/CD、支持自定义域名
- 配置：通过.github/workflows/deploy.yml 自动部署
- 域名：blog.zenheart.site/travel/

### 开发工具

- **包管理**: pnpm（更快、更节省空间） ✅
- **代码规范**: ESLint + Prettier ✅
- **测试**: Vitest + Testing Library
- **类型检查**: TypeScript 5.8 ✅

## 关键实现要点

### 工具面板设计

1. **PC 端**: 侧边栏形式，宽度 300px，不遮挡地图内容 ✅
2. **移动端**: 全屏覆盖，提供关闭按钮和手势关闭 ✅
3. **功能**: 列表视图 + 时间轴视图，支持快速切换城市 ✅
4. **状态**: 在首页和详情页都可以打开使用 ✅

### 内容扫描机制

1. **自动扫描**: 构建时自动扫描 content 目录结构 ✅
2. **状态识别**: 通过目录名自动识别城市状态（visited/planned/wishlist） ✅
3. **文件关联**: 解析 index.md 中的内部链接，建立文件关联 ✅
4. **图片管理**: 自动收集城市目录下的图片资源 ✅
5. **空态处理**: 如果某个状态目录不存在或为空，显示空态 UI ✅

### 多文件支持

1. **标签页显示**: 城市详情页支持多个 markdown 文件的标签页显示 ✅
2. **内部链接**: 支持 index.md 中的链接跳转到其他 markdown 文件（SPA 更新） ✅
3. **文件导航**: 提供文件间的导航功能 ✅
4. **内容关联**: 保持文件间的关联关系 ✅

### 数据生成

1. **构建时生成**: 在构建过程中生成城市数据 ✅
2. **动态加载**: 运行时动态加载 markdown 内容 ✅
3. **缓存策略**: 实现内容缓存以提高性能 ✅
4. **增量更新**: 支持内容的增量更新 ✅
5. **真实数据**: 直接使用 content 目录中的真实城市数据 ✅

### 部署配置

1. **GitHub Pages**: 配置自动部署 ✅
2. **自定义域名**: blog.zenheart.site/travel/ ✅
3. **HTTPS 支持**: 确保 HTTPS 访问 ✅
4. **性能优化**: 静态资源优化

### 错误处理策略

1. **网络错误**: 显示友好提示，提供重试选项 ✅
2. **内容错误**: 显示错误页面，提供返回首页 ✅
3. **图片错误**: 显示默认占位图 ✅
4. **地图错误**: 显示错误提示，提供重试按钮 ✅

### 用户体验优化

1. **加载状态**: 提供友好的加载动画 ✅
2. **空态处理**: 优雅的空态页面设计 ✅
3. **错误反馈**: 清晰的错误信息提示 ✅
4. **交互反馈**: 及时的交互状态反馈 ✅

## Bug 修复记录

### Markdown 表格渲染问题

**问题描述**: 当前 Markdown 渲染器不支持 GitHub Flavored Markdown (GFM) 格式的表格渲染，导致深圳旅游攻略中的表格无法正常显示。

**修复方案**:

1. 安装 `remark-gfm` 插件支持 GFM 功能
2. 在 MarkdownRenderer 组件中启用 remarkPlugins
3. 保持现有表格样式不变，确保不影响其他功能

**修复时间**: 2025 年 7 月 28 日
