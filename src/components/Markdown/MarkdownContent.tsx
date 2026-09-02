import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TabNavigation } from './TabNavigation';
import { MarkdownFile } from '../../types/city';

interface MarkdownContentProps {
  files: MarkdownFile[];
  className?: string;
  basePath?: string; // 添加basePath参数
  initialFile?: string; // 指定初始展开的文件名，用于从地图子点位直达
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  files,
  className = '',
  basePath = '',
  initialFile
}) => {
  const [activeFile, setActiveFile] = useState(
    initialFile || files[0]?.name || ''
  );

  // 路由上的目标文件变化时（例如从地图点了另一个子地点），切换到对应 tab
  useEffect(() => {
    if (initialFile) {
      setActiveFile(initialFile);
    }
  }, [initialFile]);

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无内容</h3>
        <p className="text-gray-500">该城市暂无相关攻略内容</p>
      </div>
    );
  }

  const currentFile = files.find(file => file.name === activeFile) || files[0];

  return (
    <div className={className}>
      <TabNavigation
        files={files}
        activeFile={activeFile}
        onFileChange={setActiveFile}
      />
      <MarkdownRenderer content={currentFile.content} basePath={basePath} />
    </div>
  );
}; 