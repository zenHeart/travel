import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const fm = s => { const m = s.match(/^---\r?\n([\s\S]*?)\r?\n---/); return m ? (yaml.load(m[1]) || {}) : null; };
const issues = [];
const add = (sev, cat, msg) => issues.push({ sev, cat, msg });

// ---- 1. 收集所有内容文件 ----
const files = [];
for (const st of ['visited', 'planned', 'wishlist']) {
  const d = `content/cities/${st}`;
  if (!fs.existsSync(d)) continue;
  for (const city of fs.readdirSync(d)) {
    const dir = `${d}/${city}`;
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.md'))) {
      files.push({ status: st, city, name: f, full: `${dir}/${f}`, isIndex: f === 'index.md' });
    }
  }
}

// ---- 2. index.md frontmatter 契约 ----
const ids = {}, coords = {};
for (const f of files.filter(x => x.isIndex)) {
  const c = fs.readFileSync(f.full, 'utf8');
  const o = fm(c);
  if (!o) { add('ERR', 'frontmatter', `${f.full} 缺 frontmatter`); continue; }
  for (const k of ['chinese_name', 'english_name']) if (!o[k]) add('ERR', 'frontmatter', `${f.full} 缺 ${k}`);
  if (!Array.isArray(o.coordinates) || o.coordinates.length !== 2) add('ERR', 'frontmatter', `${f.full} coordinates 非二元组`);
  else {
    const [lng, lat] = o.coordinates;
    if (lng < 73 || lng > 136) add('ERR', 'coords', `${f.full} 经度越界 ${lng}`);
    if (lat < 3 || lat > 54) add('ERR', 'coords', `${f.full} 纬度越界 ${lat}`);
    (coords[JSON.stringify(o.coordinates)] ||= []).push(o.chinese_name);
  }
  (ids[f.city] ||= []).push(f.status);
}
for (const [id, sts] of Object.entries(ids)) if (sts.length > 1) add('ERR', 'id冲突', `cityId "${id}" 同时存在于 ${sts.join(', ')}`);

// ---- 3. 子页 frontmatter（可选，但写了就要合契约）----
for (const f of files.filter(x => !x.isIndex)) {
  const c = fs.readFileSync(f.full, 'utf8');
  const o = fm(c);
  if (!o) continue;
  if (o.coordinates) {
    if (!Array.isArray(o.coordinates) || o.coordinates.length !== 2)
      add('ERR', 'frontmatter', `${f.full} 子页 coordinates 非二元组`);
    else if (!o.chinese_name)
      add('ERR', 'frontmatter', `${f.full} 有 coordinates 但缺 chinese_name（不会生成地图点位）`);
    else (coords[JSON.stringify(o.coordinates)] ||= []).push(o.chinese_name);
  }
}
for (const [c, names] of Object.entries(coords)) if (names.length > 1) add('ERR', 'coords', `坐标重叠 ${c}: ${names.join(' / ')}`);

// ---- 4. 站内 .md 相对链接是否解析 ----
for (const f of files) {
  const c = fs.readFileSync(f.full, 'utf8');
  for (const m of c.matchAll(/\[([^\]]*)\]\((\.\/[^)]+\.md)\)/g)) {
    const target = path.join(path.dirname(f.full), m[2]);
    if (!fs.existsSync(target)) add('ERR', '死链', `${f.full} → ${m[2]}（${m[1]}）不存在`);
  }
}

// ---- 5. 图片引用是否存在 ----
for (const f of files) {
  const c = fs.readFileSync(f.full, 'utf8');
  for (const m of c.matchAll(/!\[[^\]]*\]\((\.\/[^)]+)\)/g)) {
    const src = path.join(path.dirname(f.full), m[1]);
    if (!fs.existsSync(src)) add('ERR', '死图', `${f.full} → ${m[1]} 不存在`);
    else {
      const pub = src.replace(/^content\//, 'public/content/');
      if (!fs.existsSync(pub)) add('WARN', '图片未入库', `${m[1]} 未复制到 public/（CI 只跑 vite build，线上会 404）`);
    }
  }
}

// ---- 6. 空文件 / 过短文件 ----
for (const f of files) {
  const c = fs.readFileSync(f.full, 'utf8').replace(/^---[\s\S]*?---/, '').trim();
  if (c.length < 40) add('WARN', '内容过短', `${f.full} 正文仅 ${c.length} 字符`);
  if (!/^#\s+/m.test(c)) add('WARN', '缺标题', `${f.full} 无一级标题（tab 名会退化）`);
}

// ---- 7. 编号引用一致性：正文用到的 [n] 必须在「参考来源」有对应条目，且该条目含可点击链接 ----
for (const f of files) {
  const c = fs.readFileSync(f.full, 'utf8');
  const refSec = c.split(/^##\s*参考来源\s*$/m)[1];
  const used = new Set();
  // 只取正文（参考来源之前）里的 [n] / [n][m]
  const body = c.split(/^##\s*参考来源\s*$/m)[0];
  for (const m of body.matchAll(/\[(\d{1,2})\](?!\()/g)) used.add(Number(m[1]));
  if (!used.size) continue;
  if (!refSec) { add('ERR', '引用', `${f.full} 正文用了 ${[...used].join(',')} 但没有「参考来源」小节`); continue; }
  const defined = new Set();
  for (const m of refSec.matchAll(/^(\d{1,2})\.\s+(.*)$/gm)) {
    const n = Number(m[1]);
    defined.add(n);
    if (!/\]\(https?:\/\//.test(m[2])) add('ERR', '引用', `${f.full} 来源 [${n}] 不含可点击链接`);
  }
  for (const n of used) if (!defined.has(n)) add('ERR', '引用', `${f.full} 正文引用 [${n}] 无对应来源条目`);
  for (const n of defined) if (!used.has(n)) add('WARN', '引用', `${f.full} 来源 [${n}] 定义了但正文未引用`);
}

console.log(`扫描 ${files.length} 个 Markdown 文件\n`);
const bySev = { ERR: [], WARN: [] };
for (const i of issues) bySev[i.sev].push(i);
for (const sev of ['ERR', 'WARN']) {
  if (!bySev[sev].length) continue;
  console.log(`${sev === 'ERR' ? '✗ 错误' : '⚠ 提醒'} (${bySev[sev].length})`);
  for (const i of bySev[sev]) console.log(`   [${i.cat}] ${i.msg}`);
  console.log();
}
if (!issues.length) console.log('✓ 内容层无问题');
process.exit(bySev.ERR.length ? 1 : 0);
