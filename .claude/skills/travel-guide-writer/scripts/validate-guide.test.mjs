import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { validateGuide } from './validate-guide.mjs';

const script = fileURLToPath(new URL('./validate-guide.mjs', import.meta.url));
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const frontmatter = (meta, body) => `---\n${meta}\n---\n\n${body}\n`;
const city = (day = '2026-09-25', steps = '1. `约 09:30–10:30` 早餐。\n2. **`出站后`** 取行李。') => frontmatter('type: city\nchinese_name: 测试城', `# 测试城\n\n## 行程\n\n### ${day} · 抵达\n\n出发前按订单核对。\n\n${steps}\n\n## 吃\n\n- 早餐\n\n## 景点\n\n- 海边`);
const overview = (preparation = '## 出发准备\n\n1. 证件\n\n   - [ ] 带原件\n\n2. 行李\n\n   - [x] 装包', meta = 'status: planned\nstart_date: "2026-09-25"') => frontmatter(`type: trip\ntitle: 测试\n${meta}`, `# 测试行程\n\n## 整体行程\n\n- 沿海散步\n\n${preparation}\n\n## 成本\n\n订单金额未提供。`);

function fixture(t, files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'travel-guide-validation-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  }
  return dir;
}

test('当前六篇攻略作为正向样本', () => {
  const result = validateGuide(path.join(root, 'content/trip/2026-09-25-zhuhai-hongkong-guangzhou'));
  assert.equal(result.files.length, 6);
  assert.deepEqual(result.issues, []);
});

test('有说明段、加粗时间、相对时间和任意数量分类的合法攻略通过', (t) => {
  const dir = fixture(t, { 'README.md': overview(), 'a.md': city(), 'b.md': city() });
  assert.deepEqual(validateGuide(dir).issues, []);
});

test('多城市总览拒绝缺少成本、栏目错序和额外栏目', (t) => {
  const source = overview();
  const dir = fixture(t, { 'README.md': source, 'a.md': city(), 'b.md': city() });
  for (const invalid of [
    source.replace('## 成本', '成本'),
    source.replace('## 整体行程', '## 成本').replace(/## 成本(?=\n\n订单金额)/, '## 整体行程'),
    `${source}\n## 途中提醒\n\n随时调整。`,
    `${source}\n## 成本\n\n重复账单。`,
  ]) {
    fs.writeFileSync(path.join(dir, 'README.md'), invalid);
    assert.ok(validateGuide(path.join(dir, 'README.md')).issues.some((issue) => issue.rule === '总览结构'));
  }
});

test('无效日历日期、省略年份、缺时间或动作和checkbox时间轴均失败', (t) => {
  const dir = fixture(t, { 'README.md': overview(), 'invalid.md': city('2026-02-30'), 'partial.md': city('9.25'), 'missing.md': city('2026-09-25', '1. 去景点。'), 'empty.md': city('2026-09-25', '1. **`09:30`**'), 'checkbox.md': city('2026-09-25', '- [ ] `09:30` 去景点。') });
  const issues = validateGuide(dir).issues;
  for (const file of ['invalid.md', 'partial.md', 'missing.md', 'empty.md', 'checkbox.md']) assert.ok(issues.some((issue) => issue.file === path.join(dir, file) && issue.line > 1), file);
  assert.ok(issues.some((issue) => issue.rule === '日期'));
  assert.ok(issues.some((issue) => issue.rule === '时间轴'));
});

test('合法闰日通过，start_date 的非闰日被拒绝', (t) => {
  const dir = fixture(t, { 'README.md': overview(undefined, 'status: planned\nstart_date: "2024-02-29"'), 'a.md': city('2024-02-29') });
  assert.deepEqual(validateGuide(dir).issues, []);
  fs.writeFileSync(path.join(dir, 'README.md'), overview(undefined, 'status: planned\nstart_date: "2025-02-29"'));
  assert.ok(validateGuide(dir).issues.some((issue) => issue.rule === '日期' && issue.line === 1));
});

test('重复准备标题、h3分类、平铺checkbox和无checkbox分类被拒绝', (t) => {
  const dir = fixture(t, { 'README.md': overview(), 'a.md': city(), 'b.md': city() });
  for (const preparation of [
    '## 出发准备\n\n1. 证件\n\n   - [ ] 原件\n\n## 出发准备\n\n- [ ] 包',
    '## 出发准备\n\n### 证件\n\n- [ ] 原件',
    '## 出发准备\n\n- [ ] 原件',
    '## 出发准备\n\n1. 证件\n\n   - 原件',
  ]) {
    fs.writeFileSync(path.join(dir, 'README.md'), overview(preparation));
    assert.ok(validateGuide(path.join(dir, 'README.md')).issues.some((issue) => ['总览准备', '准备分类'].includes(issue.rule)), preparation);
  }
});

test('准备段即使有正确编号清单，额外h4分类也必须拒绝', (t) => {
  const preparation = '## 出发准备\n\n1. 证件\n\n   - [ ] 原件\n\n#### 行李分类\n\n装随身包。';
  const source = overview(preparation);
  const dir = fixture(t, { 'README.md': source, 'a.md': city(), 'b.md': city() });
  const line = source.split('\n').findIndex((text) => text.startsWith('#### ')) + 1;
  assert.ok(validateGuide(path.join(dir, 'README.md')).issues.some((issue) => issue.rule === '准备分类' && issue.line === line));
});

test('city必须有行程吃景点，note与未定wishlist不强造日期', (t) => {
  const dir = fixture(t, { 'README.md': overview(undefined, 'status: wishlist'), 'a.md': city('日期待定', '路线待选。'), 'note.md': frontmatter('type: note', '# 办事指南\n\n## 2026-09-29 办事\n\n1. 提交资料。'), 'bad.md': frontmatter('type: city', '# 不完整') });
  assert.deepEqual(validateGuide(path.join(dir, 'a.md')).issues, []);
  assert.deepEqual(validateGuide(path.join(dir, 'note.md')).issues, []);
  assert.equal(validateGuide(path.join(dir, 'bad.md')).issues.filter((issue) => issue.rule === '城市结构').length, 3);
});

test('链接按真实h2/h3 slug和重复序号校验，忽略围栏里的伪链接', (t) => {
  const target = frontmatter('type: note', '# 附录\n\n## **吃**\n\n## 吃\n\n### 出发准备 checklist');
  const body = '# 入口\n\n[重复标题](./target.md#吃-1)\n\n[中文编码](./target.md#%E5%90%83)\n\n[空格slug](./target.md#出发准备-checklist)\n\n![图](./map.png)\n\n```md\n[假链接](./absent.md#不存在)\n```';
  const dir = fixture(t, { 'README.md': frontmatter('type: note', body), 'target.md': target, 'map.png': 'fixture' });
  assert.deepEqual(validateGuide(path.join(dir, 'README.md')).issues, []);
  fs.appendFileSync(path.join(dir, 'README.md'), '\n[坏锚点](./target.md#缺失)\n\n[坏文件](./missing.md#吃)\n\n![坏图](./missing.png)\n');
  const issues = validateGuide(path.join(dir, 'README.md')).issues;
  assert.deepEqual(issues.map((issue) => issue.rule), ['锚点', '链接', '图片']);
  assert.ok(issues.every((issue) => issue.line > 1 && path.isAbsolute(issue.file)));
});

test('单文件只校验选中文件，不校验未选历史；CLI失败返回非0与完整位置', (t) => {
  const dir = fixture(t, { 'selected.md': frontmatter('type: note', '# 有效'), 'legacy.md': '历史稿没有frontmatter' });
  assert.deepEqual(validateGuide(path.join(dir, 'selected.md')).issues, []);
  const result = spawnSync(process.execPath, [script, path.join(dir, 'legacy.md')], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes(`${path.join(dir, 'legacy.md')}:1`));
  assert.match(result.stdout, /不核验旅行事实/);
});

test('CLI拒绝空参数和多参数，不隐式全仓扫描', () => {
  for (const args of [[], ['one.md', 'two.md']]) {
    const result = spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stdout, /用法/);
  }
});

test('拒绝仓库根或多个trip的父目录，避免扩大到历史扫描', (t) => {
  const dir = fixture(t, { 'trip-a/README.md': overview(), 'trip-b/README.md': '历史游记' });
  assert.equal(validateGuide(dir).files.length, 0);
  assert.equal(validateGuide(root).files.length, 0);
  assert.match(validateGuide(dir).issues[0].message, /未继续扫描/);
});

test('CLI在禁用Node原生TS剥离时仍复用前端锚点校验', (t) => {
  const dir = fixture(t, { 'guide.md': frontmatter('type: note', '# 指南\n\n## 出发准备 checklist\n\n[本页](#出发准备-checklist)') });
  const result = spawnSync(process.execPath, ['--no-experimental-strip-types', script, path.join(dir, 'guide.md')], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /0 个格式问题/);
});

test('.agents符号链接CLI入口实际检查坏稿和合法稿', (t) => {
  const alias = path.join(root, '.agents/skills/travel-guide-writer/scripts/validate-guide.mjs');
  const dir = fixture(t, { 'bad.md': '缺少frontmatter', 'good.md': frontmatter('type: note', '# 正常稿') });
  const bad = spawnSync(process.execPath, [alias, path.join(dir, 'bad.md')], { cwd: root, encoding: 'utf8' });
  assert.equal(bad.status, 1, bad.stderr);
  assert.ok(bad.stderr.includes(`${path.join(dir, 'bad.md')}:1`));
  assert.match(bad.stdout, /检查 1 个/);
  const good = spawnSync(process.execPath, [alias, path.join(dir, 'good.md')], { cwd: root, encoding: 'utf8' });
  assert.equal(good.status, 0, good.stderr);
  assert.match(good.stdout, /检查 1 个.*0 个格式问题/);
});
