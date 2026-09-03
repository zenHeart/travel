import React, { useEffect, useRef, useState } from 'react';
import { TocItem } from '../../utils/toc';
import { NavPanel } from './NavPanel';

interface TableOfContentsProps {
  items: TocItem[];
  scrollRef: React.RefObject<HTMLElement | null>;
  /** 切换文档时重置 */
  resetKey?: string;
  variant: 'rail' | 'collapse';
}

/** 内容导航：当前文档内的标题跳转 + 滚动高亮。始终纵向。 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  scrollRef,
  resetKey,
  variant,
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const tickingRef = useRef(false);

  useEffect(() => setActiveId(''), [resetKey]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || items.length === 0) return;

    const compute = () => {
      tickingRef.current = false;
      const rootTop = root.getBoundingClientRect().top;
      let current = items[0]?.id ?? '';
      for (const it of items) {
        const el = root.querySelector<HTMLElement>(`#${CSS.escape(it.id)}`);
        if (!el) continue;
        if (el.getBoundingClientRect().top - rootTop <= 80) current = it.id;
        else break;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(compute);
    };

    compute();
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [items, scrollRef, resetKey]);

  if (items.length < 2) return null;

  const jump = (id: string) => {
    const root = scrollRef.current;
    const el = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!root || !el) return;
    const top =
      el.getBoundingClientRect().top -
      root.getBoundingClientRect().top +
      root.scrollTop -
      12;
    root.scrollTo({ top, behavior: 'smooth' });
    setActiveId(id);
  };

  const activeText = items.find((i) => i.id === activeId)?.text;

  return (
    <NavPanel
      label="本页目录"
      summary={activeText || items[0]?.text}
      variant={variant}
    >
      <ul className="space-y-0.5">
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <li key={it.id}>
              <button
                onClick={() => jump(it.id)}
                aria-current={active ? 'true' : undefined}
                className={[
                  'block w-full border-l py-1.5 text-left text-[13px] leading-snug transition-colors lg:py-1',
                  it.level === 3 ? 'pl-5 pr-2' : 'pl-3 pr-2',
                  active
                    ? 'border-teal-600 font-medium text-teal-800'
                    : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800',
                ].join(' ')}
              >
                {it.text}
              </button>
            </li>
          );
        })}
      </ul>
    </NavPanel>
  );
};
