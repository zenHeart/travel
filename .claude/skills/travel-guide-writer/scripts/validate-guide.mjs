#!/usr/bin/env node
// 只校验显式指定的攻略范围；不核验票价、班次、订单或其他旅行事实。
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import yaml from 'js-yaml';
import ts from 'typescript';
import { parse, postprocess, preprocess } from 'micromark';
import { gfm } from 'micromark-extension-gfm';

// 复用前端无依赖的锚点实现；使用已有 TypeScript，不依赖 Node 原生 TS 剥离。
const tocSource = fs.readFileSync(new URL('../../../../src/utils/toc.ts', import.meta.url), 'utf8');
const { outputText: tocModule } = ts.transpileModule(tocSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { extractToc } = await import(`data:text/javascript;base64,${Buffer.from(tocModule).toString('base64')}`);

const markdownFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? markdownFiles(file) : entry.isFile() && entry.name.endsWith('.md') ? [file] : [];
}).sort();

function readDocument(file) {
  const source = fs.readFileSync(file, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  let meta = null;
  let metaError = '';
  let metaLine = 1;
  try {
    meta = frontmatter ? yaml.load(frontmatter[1], { schema: yaml.JSON_SCHEMA }) : null;
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) metaError = '需要有效的 YAML frontmatter';
  } catch (error) {
    metaError = 'frontmatter 不是有效 YAML';
    metaLine = (error.mark?.line ?? 0) + 2;
  }
  const body = frontmatter ? source.replace(frontmatter[0], frontmatter[0].replace(/[^\r\n]/g, ' ')) : source;
  const lines = body.split('\n');
  const events = postprocess(parse({ extensions: [gfm()] }).document().write(preprocess()(body, 'utf8', true)));
  const lists = [];
  const listStack = [];
  const linkStack = [];
  const links = [];
  const headingLevels = new Map();
  for (const [event, token] of events) {
    const { type, start, end } = token;
    if (type === 'listOrdered' || type === 'listUnordered') {
      if (event === 'enter') {
        const list = { ordered: type === 'listOrdered', line: start.line, end: end.line, depth: listStack.length, items: [] };
        listStack.at(-1)?.items.at(-1)?.lists.push(list);
        lists.push(list);
        listStack.push(list);
      } else listStack.pop();
    }
    if (type === 'link' || type === 'image') {
      if (event === 'enter') linkStack.push(type);
      else linkStack.pop();
    }
    if (event !== 'enter') continue;
    if (type === 'atxHeading') headingLevels.set(start.line, body.slice(start.offset, end.offset).match(/^#+/)[0].length);
    if (type === 'listItemPrefix') listStack.at(-1)?.items.push({ line: start.line, text: lines[start.line - 1].slice(end.column - 1), task: false, lists: [] });
    if (type === 'taskListCheck' && listStack.at(-1)?.items.at(-1)) listStack.at(-1).items.at(-1).task = true;
    if (type === 'resourceDestinationString' || type === 'definitionDestinationString') {
      links.push({ href: body.slice(start.offset, end.offset), line: start.line, image: linkStack.at(-1) === 'image', definition: type === 'definitionDestinationString' });
    }
  }
  return { file, source, meta: meta || {}, metaError, metaLine, lists, links, headingLevels, headings: extractToc(source).filter((heading) => headingLevels.has(heading.line)) };
}

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateGuide(input) {
  const target = path.resolve(input);
  const issues = [];
  const add = (file, line, rule, message) => issues.push({ file, line, rule, message });
  let files;
  try {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      const index = path.join(target, 'README.md');
      if (!fs.existsSync(index) || readDocument(index).meta.type !== 'trip') {
        add(index, 1, '入口', '请指定单个 trip 目录，其 README.md 需要 type: trip；未继续扫描');
        return { files: [], issues };
      }
      files = markdownFiles(target);
    } else if (stat.isFile() && target.endsWith('.md')) files = [target];
    else throw new Error('参数需要是一个 trip 目录或 .md 文件');
    if (files.length === 0) add(target, 1, '范围', '指定范围内没有 Markdown 文件');
  } catch (error) {
    add(target, 1, '输入', error.code === 'ENOENT' ? '指定路径不存在' : error.message);
    return { files: [], issues };
  }
  const cache = new Map();
  const load = (file) => {
    if (!cache.has(file)) cache.set(file, readDocument(file));
    return cache.get(file);
  };
  const sectionEnd = (doc, heading) => doc.headings.find((next) => next.line > heading.line && next.level <= heading.level)?.line ?? Infinity;

  for (const file of files) {
    const doc = load(file);
    const { meta, headings } = doc;
    if (doc.metaError) add(file, doc.metaLine, 'frontmatter', doc.metaError);
    if (!['trip', 'city', 'note'].includes(meta.type)) add(file, 1, 'type', 'type 需要是 trip、city 或 note');
    if (meta.start_date !== undefined && !isDate(meta.start_date)) add(file, 1, '日期', 'start_date 必须是有效的 YYYY-MM-DD 完整日期；日期未定时省略');
    for (const heading of headings) {
      const date = heading.text.match(/^(\d{4}-\d{1,2}-\d{1,2})(?=\D|$)/)?.[1];
      if (date && !isDate(date)) add(file, heading.line, '日期', `无效日期「${date}」，使用真实有效的 YYYY-MM-DD`);
    }

    if (meta.type === 'city' || (meta.type === 'trip' && meta.chinese_name)) {
      for (const title of ['行程', '吃', '景点']) {
        if (!headings.some((heading) => heading.level === 2 && heading.text === title)) add(file, 1, '城市结构', `缺少「## ${title}」`);
      }
      const index = path.join(path.dirname(file), 'README.md');
      const tripMeta = file === index || !fs.existsSync(index) ? meta : load(index).meta;
      const dated = Boolean(meta.start_date || tripMeta.start_date);
      const schedule = headings.find((heading) => heading.level === 2 && heading.text === '行程');
      if (schedule) {
        const days = headings.filter((heading) => heading.level === 3 && heading.line > schedule.line && heading.line < sectionEnd(doc, schedule));
        if (dated && days.length === 0) add(file, schedule.line, '日期行程', '已明确出发日期的行程需要「### YYYY-MM-DD · 地点」');
        for (const day of days) {
          const date = day.text.match(/^(\d{4}-\d{2}-\d{2})(?=\D|$)/)?.[1];
          if (!date) {
            if (dated) add(file, day.line, '日期行程', '日期标题使用 YYYY-MM-DD；不得省略年份或补猜日期');
            continue;
          }
          const dailyLists = doc.lists.filter((list) => list.depth === 0 && list.line > day.line && list.line < sectionEnd(doc, day));
          if (!dailyLists.some((list) => list.ordered)) add(file, day.line, '时间轴', '日期下需要有序时间列表；说明段可以放在列表前');
          for (const list of dailyLists) {
            if (!list.ordered) add(file, list.line, '时间轴', '日期时间轴使用有序列表，不使用散点或 checkbox');
            for (const item of list.items) {
              if (!/^(?:\*\*|__)?`[^`]+`(?:\*\*|__)?\s+\S/.test(item.text.trim())) add(file, item.line, '时间轴', '每项以反引号时间标记开头，再写动作；支持约、前后、时间范围和加粗时间');
            }
          }
        }
      }
    }

    if (meta.type === 'trip' && !meta.chinese_name) {
      const cityCount = fs.readdirSync(path.dirname(file)).filter((name) => name.endsWith('.md') && name !== path.basename(file))
        .filter((name) => fs.statSync(path.join(path.dirname(file), name)).isFile() && load(path.join(path.dirname(file), name)).meta.type === 'city').length;
      if (cityCount >= 2) {
        const preparations = headings.filter((heading) => heading.level === 2 && /^出发准备(?:\s+checklist)?$/i.test(heading.text));
        if (preparations.length !== 1) add(file, preparations[1]?.line ?? 1, '总览准备', '多城市总览需且仅需一个「## 出发准备」');
        for (const preparation of preparations) {
          const end = sectionEnd(doc, preparation);
          for (const [line, level] of doc.headingLevels) {
            if (line > preparation.line && line < end && level > 2) add(file, line, '准备分类', '准备类别使用编号列表，不使用 h3–h6 标题');
          }
          const groups = doc.lists.filter((list) => list.depth === 0 && list.line > preparation.line && list.line < end);
          if (groups.length !== 1 || !groups[0].ordered) add(file, preparation.line, '准备分类', '准备事项需为一个分类有序列表，各分类下嵌套 checkbox');
          for (const group of groups) for (const category of group.items) {
            if (category.task || category.lists.length === 0 || category.lists.some((list) => list.ordered || list.items.some((item) => !item.task))) add(file, category.line, '准备分类', '每个编号类别下必须嵌套无序 checkbox 清单');
          }
        }
      }
    }

    for (const link of doc.links) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(link.href)) continue;
      let pathname;
      let anchor;
      try {
        const hash = link.href.indexOf('#');
        pathname = decodeURIComponent((hash < 0 ? link.href : link.href.slice(0, hash)).split('?')[0]).replace(/\\([() ])/g, '$1');
        anchor = hash < 0 ? '' : decodeURIComponent(link.href.slice(hash + 1));
      } catch {
        add(file, link.line, '链接', '链接包含无效的百分号编码');
        continue;
      }
      if (!link.image && !link.definition && pathname && !pathname.endsWith('.md')) continue;
      const destination = pathname ? path.resolve(path.dirname(file), pathname) : file;
      if (!fs.existsSync(destination) || !fs.statSync(destination).isFile()) {
        add(file, link.line, link.image ? '图片' : '链接', `本地目标不存在：${destination}`);
      } else if (anchor && destination.endsWith('.md') && !load(destination).headings.some((heading) => heading.id === anchor)) {
        add(file, link.line, '锚点', `目标没有可渲染的 h2/h3 锚点：${destination}#${anchor}`);
      }
    }
  }
  return { files, issues };
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0] === '--help') {
    console.log('用法：node .claude/skills/travel-guide-writer/scripts/validate-guide.mjs <trip目录或Markdown文件>');
    process.exitCode = args[0] === '--help' && args.length === 1 ? 0 : 2;
  } else {
    try {
      const { files, issues } = validateGuide(args[0]);
      for (const issue of issues) console.error(`${issue.file}:${issue.line} [${issue.rule}] ${issue.message}`);
      console.log(`检查 ${files.length} 个显式范围内的 Markdown 文件，${issues.length} 个格式问题。仅检查结构与本地引用，不核验旅行事实。`);
      process.exitCode = issues.length ? 1 : 0;
    } catch (error) {
      console.error(`${path.resolve(args[0])}:1 [读取] ${error.message}`);
      process.exitCode = 1;
    }
  }
}
