// 自定义Markdown处理器
export const processMarkdownContent = (content: string): string => {
  let processedContent = content;

  // 处理自定义标签 [[城市ID]] 或 [[城市ID|显示文本]]
  processedContent = processedContent.replace(
    /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,
    (_match, cityId, displayText) => {
      const text = displayText || cityId;
      return `[${text}](/city/${cityId})`;
    }
  );

  // 处理高亮文本 **文本**
  processedContent = processedContent.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong>$1</strong>'
  );

  // 处理斜体文本 *文本*
  processedContent = processedContent.replace(
    /\*([^*]+)\*/g,
    '<em>$1</em>'
  );

  // 处理删除线 ~~文本~~
  processedContent = processedContent.replace(
    /~~([^~]+)~~/g,
    '<del>$1</del>'
  );

  // 处理内联代码 `代码`
  processedContent = processedContent.replace(
    /`([^`]+)`/g,
    '<code>$1</code>'
  );

  // 处理任务列表 - [ ] 和 - [x]
  processedContent = processedContent.replace(
    /^- \[ \] (.+)$/gm,
    '- <input type="checkbox" disabled /> $1'
  );
  processedContent = processedContent.replace(
    /^- \[x\] (.+)$/gm,
    '- <input type="checkbox" checked disabled /> $1'
  );

  // 处理表格对齐
  processedContent = processedContent.replace(
    /^\|(.+)\|$/gm,
    (_match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const processedCells = cells.map((cell: string) => {
        // 处理单元格内的markdown语法
        let processedCell = cell;
        processedCell = processedCell.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        processedCell = processedCell.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        processedCell = processedCell.replace(/`([^`]+)`/g, '<code>$1</code>');
        return processedCell;
      });
      return `| ${processedCells.join(' | ')} |`;
    }
  );

  return processedContent;
};

// 处理表格头部对齐
export const processTableAlignment = (content: string): string => {
  return content.replace(
    /^\|(.+)\|$/gm,
    (_match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const processedCells = cells.map((cell: string) => {
        // 检测对齐方式
        if (cell.startsWith(':') && cell.endsWith(':')) {
          return 'text-center';
        } else if (cell.endsWith(':')) {
          return 'text-right';
        } else {
          return 'text-left';
        }
      });
      return `| ${processedCells.join(' | ')} |`;
    }
  );
};

// 处理特殊语法
export const processSpecialSyntax = (content: string): string => {
  let processedContent = content;

  // 处理时间格式 `时间`
  processedContent = processedContent.replace(
    /`(\d{1,2}:\d{2}-\d{1,2}:\d{2})`/g,
    '<code class="time-code">$1</code>'
  );

  // 处理价格格式 `价格`
  processedContent = processedContent.replace(
    /`(\d+元\/人)`/g,
    '<code class="price-code">$1</code>'
  );

  // 处理重要信息 **重要**
  processedContent = processedContent.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="important">$1</strong>'
  );

  return processedContent;
}; 