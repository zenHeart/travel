import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

const fm = s => { const m = s.match(/^---\r?\n([\s\S]*?)\r?\n---/); return m ? (yaml.load(m[1]) || {}) : null; };
const issues = [];
const add = (sev, cat, msg) => issues.push({ sev, cat, msg });

// ---- 1. 所有游记文档与 frontmatter 契约 ----
const files = [];
const root = 'content/trip';
for (const trip of fs.readdirSync(root)) {
  const dir = `${root}/${trip}`;
  if (!fs.statSync(dir).isDirectory()) continue;
  const index = `${dir}/README.md`;
  if (!fs.existsSync(index)) { add('ERR', '目录', `${dir} 缺 README.md`); continue; }
  for (const name of fs.readdirSync(dir).filter(name => name.endsWith('.md'))) {
    const full = `${dir}/${name}`;
    files.push({ trip, name, full, isIndex: name === 'README.md' });
    const meta = fm(fs.readFileSync(full, 'utf8'));
    if (!meta) { add('ERR', 'frontmatter', `${full} 缺 frontmatter`); continue; }
    if (name === 'README.md' && (meta.type !== 'trip' || !meta.title || !['visited', 'planned', 'wishlist'].includes(meta.status)))
      add('ERR', 'frontmatter', `${full} 需包含 type: trip、title、有效 status`);
    if (name !== 'README.md' && !['city', 'note'].includes(meta.type))
      add('ERR', 'frontmatter', `${full} 需包含 type: city 或 note`);
    if (meta.type === 'city' && (!meta.chinese_name || !meta.coordinates))
      add('ERR', 'frontmatter', `${full} 城市页需包含 chinese_name 与 coordinates`);
    if (meta.coordinates) {
      const [lng, lat] = meta.coordinates;
      if (!Array.isArray(meta.coordinates) || meta.coordinates.length !== 2 || !Number.isFinite(lng) || !Number.isFinite(lat) || lng < 73 || lng > 136 || lat < 3 || lat > 54)
        add('ERR', '坐标', `${full} coordinates 无效`);
    }
  }
}
for (const place of fs.readdirSync('content/place')) {
  const full = `content/place/${place}/README.md`;
  if (!fs.existsSync(full)) { add('ERR', '目录', `${full} 不存在`); continue; }
  files.push({ place, name: 'README.md', full, isIndex: true });
  const meta = fm(fs.readFileSync(full, 'utf8'));
  if (meta?.type !== 'place' || !meta.chinese_name || !Array.isArray(meta.coordinates) || meta.coordinates.length !== 2)
    add('ERR', 'frontmatter', `${full} 需包含 type: place、chinese_name、coordinates`);
}

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
    // 可点击 = 外链或站内相对链接
    if (!/\]\((https?:\/\/|\.\/)/.test(m[2]))
      add('ERR', '引用', `${f.full} 来源 [${n}] 不含可点击链接`);
  }
  for (const n of used) if (!defined.has(n)) add('ERR', '引用', `${f.full} 正文引用 [${n}] 无对应来源条目`);
  for (const n of defined) if (!used.has(n)) add('WARN', '引用', `${f.full} 来源 [${n}] 定义了但正文未引用`);
}

// ---- 8. 加粗标记位移：中文标点被写进 ** 之内，导致渲染出字面 ** ----
// CommonMark 的左右侧翼规则里中文标点算 punctuation，`改期**，不保证**` 这种写法
// 起始 ** 不构成合法开标记，会原样输出。正确写法是 `改期，**不保证**`。
const strongLead = /^[，。、；：！？）」』】》,.;:!?]/;
const strongTail = /[（「『【《(]$/;
for (const f of files) {
  fs.readFileSync(f.full, 'utf8').split('\n').forEach((line, i) => {
    if (!line.includes('**')) return;
    const html = micromark(line.replace(/\|/g, ' '), { extensions: [gfm()], htmlExtensions: [gfmHtml()] });
    const at = `${f.full}:${i + 1}`;
    if (html.includes('**'))
      add('ERR', '加粗', `${at} ** 未成对解析，会渲染出字面星号：${line.trim().slice(0, 60)}`);
    for (const m of html.matchAll(/<strong>([\s\S]*?)<\/strong>/g)) {
      const t = m[1].replace(/<[^>]+>/g, '');
      if (strongLead.test(t)) add('WARN', '加粗', `${at} 加粗以标点开头「${t.slice(0, 12)}…」，** 应移到标点之后`);
      if (strongTail.test(t)) add('WARN', '加粗', `${at} 加粗以开括号结尾「…${t.slice(-12)}」，** 应移到括号之前`);
    }
  });
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
