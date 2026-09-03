import React, { useEffect, useRef } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MarkdownFile } from '../../types/city';
import { TocItem } from '../../utils/toc';

interface MarkdownContentProps {
  files: MarkdownFile[];
  activeFile: string;
  /** 与正文标题按文档顺序一一对应，用于赋锚点 id */
  toc: TocItem[];
  className?: string;
  basePath?: string;
}

/** 渲染当前文档，并在渲染后按顺序给 h2/h3 赋锚点 id */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  files,
  activeFile,
  toc,
  className = '',
  basePath = '',
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const currentFile = files.find((f) => f.name === activeFile) || files[0];

  // 按文档顺序赋 id：与 extractToc 的解析顺序天然对齐，
  // 不依赖渲染期计数器，因此不受 StrictMode 重复调用影响
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const headings = host.querySelectorAll<HTMLElement>('h2, h3');
    headings.forEach((el, i) => {
      const item = toc[i];
      if (item) el.id = item.id;
      else el.removeAttribute('id');
    });
  }, [toc, currentFile?.name, currentFile?.content]);

  if (files.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">该城市还没有攻略内容</p>
      </div>
    );
  }

  return (
    <div ref={hostRef} className={className}>
      <MarkdownRenderer content={currentFile.content} basePath={basePath} />
    </div>
  );
};
