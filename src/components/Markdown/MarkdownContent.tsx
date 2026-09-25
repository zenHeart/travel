import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TripDocument } from '../../types/trip';
import { TocItem } from '../../utils/toc';

interface MarkdownContentProps {
  files: TripDocument[];
  activeFile: string;
  /** 与正文标题按文档顺序一一对应，用于赋锚点 id */
  toc: TocItem[];
  className?: string;
  basePath?: string;
}

/** 渲染当前文档，标题锚点与目录共用同一份 TOC 数据。 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  files,
  activeFile,
  toc,
  className = '',
  basePath = '',
}) => {
  const currentFile = files.find((f) => f.name === activeFile) || files[0];

  if (files.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">该游记还没有内容</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MarkdownRenderer key={`${basePath}/${currentFile.name}`} content={currentFile.content} basePath={basePath} documentKey={currentFile.name} toc={toc} />
    </div>
  );
};
