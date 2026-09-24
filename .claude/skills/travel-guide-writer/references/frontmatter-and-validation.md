# 目录、frontmatter 与校验

以仓库 `README.md`、`scripts/audit-content.js`、`src/utils/tripScanner.ts` 和页面渲染实现为准；本文件是写作速查。结构变更前读对应实现，不沿用旧版城市目录规则。

## 行程与分页

```text
content/trip/<trip-id>/
├── README.md              # type: trip，总览或单城市全文
├── zhuhai.md              # type: city，城市行程与地图点位
├── zhuhai/
│   └── chimelong.md        # type: note，长隆玩法
├── hongkong.md            # type: city
└── hongkong/
    └── banking.md         # type: note，办卡流程
```

- 入口 `README.md` 必填 `type: trip`、`title`、`status`；状态为 `visited`、`planned`、`wishlist` 之一。
- 日期确认时用 `start_date: "YYYY-MM-DD"`；仅知道年份用 `start_year`，不把提交日期冒充出行日期。
- 单城市入口可加 `chinese_name`、`coordinates` 生成地图点位。
- 城市页必填 `type: city`、`chinese_name`、`coordinates`；常用 `order` 控制排序、`nav_title` 控制导航短名。
- 详情页使用 `type: note`，设置 `nav_title`、`order`；详情页不生成地图点位。
- 每个嵌套页必须存在同名路径的父页面，例如 `hongkong/banking.md` 的父页面是 `hongkong.md`。导航根据路径显示层级。
- `coordinates` 为 `[经度, 纬度]` 数值数组；当前审计要求经度 73–136、纬度 3–54。超出范围的旅行需要先处理站点契约，不能填假坐标。
- 同一城市可出现在不同次历史行程；不要为去重而删除原始游记。

常驻地使用 `content/place/<place-id>/README.md`，必填 `type: place`、`chinese_name` 与坐标；不混入行程时间轴。

## 链接、页面路径与图片

- 总览到城市页：`[香港](./hongkong.md)`。
- 城市到详情：`[办卡](./hongkong/banking.md)`。
- 详情返回父页：`[香港](../hongkong.md)`。
- 网页路由：`#/<trip-id>/index`、`#/<trip-id>/hongkong`、`#/<trip-id>/hongkong/banking`。
- 移动或改名时用 `rg` 搜旧路径并修复所有受影响链接；站内链接仍引用真实 `.md` 文件。
- 图片放对应游记目录，以 `./` 或 `../` 相对引用。生产路径在 `public/content/`，按项目资源同步机制处理，实际打开确认无 404。

## Markdown 与 checkbox

- 每页有一个一级标题，正文不要空占位。
- 待办使用 `- [ ]`；只有确有完成依据才写 `- [x]`。站点已有 checkbox 点击与本地保存功能，无需为一次内容改写增加状态代码。
- 时间用反引号包裹；美食按街区、门店和菜名列表组织。表格仅在总览等确实便于速读的地方使用，不拿表格重新包装比较过程。
- 加粗内容遇中文标点可能渲染成字面星号。写作时避免 `**店名（分店）**吃饭`，改为 `**店名（分店）** 吃饭`，并运行审计检查真实 Markdown 解析。
- 数字编号来源 `[1]` 若出现，需有 `## 参考来源` 和对应带链接编号项。普通攻略优先在事实旁直接链接来源，保持正文简洁。

## 交付验证

```bash
npm run audit-content
npm run build
git diff --check
```

审计覆盖 frontmatter、父页面、站内链接、图片、短文与标题、引用编号、加粗解析；它不核验外部价格、交通和文风。另按 [写作验收](writing-style.md) 人工检查内容。

用户给出 URL 时，打开页面检查实际标题、日期清单、美食与准备事项、父子导航；不要只报告文件已存在。若验证 checkbox，使用测试项后恢复原状态，不动用户已有勾选。没运行的步骤如实报告，不能把静态检查当作自动加载或线上发布证明。
