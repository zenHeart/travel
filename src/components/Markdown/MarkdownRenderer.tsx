import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  basePath?: string; // 添加基础路径参数
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '',
  basePath = ''
}) => {
  const navigate = useNavigate();

  const handleInternalLink = (href: string) => {
    // 处理内部链接，格式为 [[城市ID]] 或 [[城市ID|显示文本]]
    const match = href.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
    if (match) {
      const cityId = match[1];
      navigate(`/city/${cityId}`);
      return;
    }
    
    // 处理普通链接
    if (href.startsWith('http')) {
      window.open(href, '_blank');
    }
  };

  const resolveImagePath = (src: string): string => {
    // 如果是绝对路径，直接返回
    if (src.startsWith('http') || src.startsWith('/')) {
      return src;
    }
    
    // 如果是相对路径，需要转换为绝对路径
    if (src.startsWith('./') || src.startsWith('../')) {
      // 移除开头的 ./
      const cleanSrc = src.replace(/^\.\//, '');
      return `/content/cities/${basePath}/${cleanSrc}`;
    }
    
    return src;
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        components={{
          // 自定义链接处理
          a: ({ href, children, ...props }) => {
            if (href) {
              return (
                <a
                  {...props}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleInternalLink(href);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {children}
                </a>
              );
            }
            return <a {...props}>{children}</a>;
          },
          // 自定义图片处理
          img: ({ src, alt, ...props }) => {
            const resolvedSrc = src ? resolveImagePath(src) : '';
            
            return (
              <div className="my-4">
                <img
                  {...props}
                  src={resolvedSrc}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'p-4 bg-gray-100 rounded-lg text-center text-gray-500';
                    errorDiv.textContent = `图片加载失败: ${alt || '未知图片'}`;
                    target.parentNode?.insertBefore(errorDiv, target);
                  }}
                  onLoad={() => {
                    console.log('图片加载成功:', resolvedSrc);
                  }}
                />
                {alt && (
                  <p className="text-sm text-gray-500 mt-2 text-center">{alt}</p>
                )}
              </div>
            );
          },
          // 自定义标题样式
          h1: ({ children, ...props }) => (
            <h1 {...props} className="text-3xl font-bold text-gray-900 mb-6 mt-8 text-left">
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 {...props} className="text-2xl font-bold text-gray-900 mb-4 mt-6 text-left">
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-xl font-semibold text-gray-900 mb-3 mt-5 text-left">
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 {...props} className="text-lg font-medium text-gray-900 mb-2 mt-4 text-left">
              {children}
            </h4>
          ),
          // 自定义段落样式
          p: ({ children, ...props }) => (
            <p {...props} className="text-gray-700 leading-relaxed mb-4 text-left">
              {children}
            </p>
          ),
          // 自定义代码块样式
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  {...props}
                  className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code {...props} className="text-sm font-mono">
                  {children}
                </code>
              </pre>
            );
          },
          // 自定义引用样式
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r-lg"
            >
              {children}
            </blockquote>
          ),
          // 自定义列表样式
          ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc list-inside space-y-2 my-4 text-left">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal list-inside space-y-2 my-4 text-left">
              {children}
            </ol>
          ),
          // 自定义列表项样式
          li: ({ children, ...props }) => (
            <li {...props} className="text-gray-700 leading-relaxed">
              {children}
            </li>
          ),
          // 自定义表格样式
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table {...props} className="min-w-full border border-gray-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th {...props} className="border border-gray-300 px-4 py-2 bg-gray-100 font-medium text-left">
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="border border-gray-300 px-4 py-2 text-left">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 