export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
  line: number;
}

/** 标题文字 → 锚点 id。TOC 与正文标题必须用同一份实现，否则跳转失效。 */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .replace(/[*`~]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接只留文字
    .replace(/\s+/g, "-")
    .replace(/[^\w一-龥-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "section";
}

/** 从 Markdown 源码提取 h2/h3，跳过 frontmatter 与代码块 */
export function extractToc(markdown: string): TocItem[] {
  const body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---/, match => "\n".repeat(match.split("\n").length - 1));
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const [index, line] of body.split("\n").entries()) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) continue;

    const text = m[2].replace(/[*`]/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
    let id = slugifyHeading(text);
    // 同名标题去重，与渲染端保持一致的计数规则
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}-${n}`;

    items.push({ id, text, level: m[1].length === 2 ? 2 : 3, line: index + 1 });
  }
  return items;
}
