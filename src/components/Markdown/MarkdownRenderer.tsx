import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import { Link, useLocation } from "react-router-dom";
import { ImagePreview } from "../Common/ImagePreview";
import { TocItem } from "../../utils/toc";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  basePath?: string; // 添加基础路径参数
  documentKey?: string;
  toc?: TocItem[];
}

const TaskCheckbox: React.FC<{
  storageKey: string;
  legacyPrefix: string;
  taskText: string;
  occurrence: number;
  initialChecked: boolean;
  label: string;
}> = ({ storageKey, legacyPrefix, taskText, occurrence, initialChecked, label }) => {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) return saved === "1";

      // 旧键包含源码行号；只接续同一文档中原文完全相同的任务。
      const legacyKeys: { key: string; line: number }[] = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith(legacyPrefix)) continue;
        const entry = key.slice(legacyPrefix.length).match(/^(\d+):([\s\S]*)$/);
        if (entry?.[2] === taskText) legacyKeys.push({ key, line: Number(entry[1]) });
      }
      const legacyKey = legacyKeys.sort((a, b) => a.line - b.line)[occurrence]?.key;
      const legacyValue = legacyKey ? localStorage.getItem(legacyKey) : null;
      if (legacyValue === null) return initialChecked;
      try {
        localStorage.setItem(storageKey, legacyValue);
      } catch {
        // 写入受限时仍显示读到的旧状态，保留原键以便下次重试。
      }
      return legacyValue === "1";
    } catch {
      return initialChecked;
    }
  });

  return (
    <label className="task-checkbox">
      <input
      type="checkbox"
      checked={checked}
      aria-label={label}
      onChange={(event) => {
        const next = event.target.checked;
        setChecked(next);
        try {
          localStorage.setItem(storageKey, next ? "1" : "0");
        } catch {
          // Storage may be unavailable; the checkbox still works until reload.
        }
      }}
      />
    </label>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  basePath = "",
  documentKey = "",
  toc = [],
}) => {
  const location = useLocation();
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
  } | null>(null);

  const tripId = basePath.split("/").at(-1) || "";
  const taskKeys = useMemo(() => {
    const occurrences = new Map<string, number>();
    return content.split("\n").map((line) => {
      const task = line.match(/^\s*(?:[-*+]|\d+[.)]) \[([ xX])\]\s+(.+)$/);
      if (!task) return null;
      // 分类标签不改变事项身份，调整标签后仍沿用原勾选状态。
      const text = task[2].replace(/^<span\s+class=(["'])task-tag\1>[^<]+<\/span>\s*/, "");
      const occurrence = occurrences.get(text) ?? 0;
      occurrences.set(text, occurrence + 1);
      return { checked: task[1].toLowerCase() === "x", text, occurrence, key: `${text}:${occurrence}` };
    });
  }, [content]);

  const resolveDocumentLink = (href: string): string | undefined => {
    // [[城市ID]] 或 [[城市ID|显示文本]]
    const wiki = href.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
    if (wiki) {
      return `/${wiki[1]}/index`;
    }

    // 页内锚点
    if (href.startsWith("#")) {
      return `${location.pathname}${href}`;
    }

    // 同一游记的相对文档路径，可指向子页或从子页返回城市页。
    const sibling = href.match(/^(?:\.\/|\.\.\/)[^#?]+\.md(?:#.*)?$/);
    if (sibling && tripId) {
      const target = new URL(href, `https://trip.local/${documentKey}`);
      const slug = target.pathname.slice(1).replace(/\.md$/, "");
      return `/${basePath}/${slug === "README" ? "index" : slug}${target.hash}`;
    }
  };

  const resolveImagePath = (src: string): string => {
    // 如果是绝对路径，直接返回
    if (src.startsWith("http") || src.startsWith("/")) {
      return src;
    }

    // 如果是相对路径，需要转换为绝对路径
    if (src.startsWith("./") || src.startsWith("../")) {
      const cleanSrc = new URL(src, `https://trip.local/${documentKey}`).pathname.slice(1);

      // 区分开发环境和生产环境
      const isDev = import.meta.env.DEV;

      if (isDev) {
        // 开发环境：直接访问content目录
        return `/content/trip/${tripId}/${cleanSrc}`;
      } else {
        // 生产环境：考虑base路径
        const deployBase = import.meta.env.VITE_BASE_URL || "/";
        return `${deployBase}content/trip/${tripId}/${cleanSrc}`.replace(
          /\/+/g,
          "/"
        );
      }
    }

    return src;
  };

  return (
    <>
      <div className={`markdown-content ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkFrontmatter]}
          rehypePlugins={[rehypeRaw]}
          components={{
            input: ({ type, ...props }) => type === 'checkbox' ? null : <input type={type} {...props} />,
            // 自定义链接处理
            a: ({ node: _node, href, children, ...props }) => {
              if (href) {
                const documentLink = resolveDocumentLink(href);
                if (documentLink) {
                  return <Link {...props} to={documentLink}>{children}</Link>;
                }
                return (
                  <a
                    {...props}
                    href={href}
                    target={/^https?:\/\//.test(href) ? "_blank" : undefined}
                    rel={/^https?:\/\//.test(href) ? "noopener noreferrer" : undefined}
                  >
                    {children}
                  </a>
                );
              }
              return <a {...props}>{children}</a>;
            },
            // 自定义图片处理
            img: ({ node: _node, src, alt, ...props }) => {
              const resolvedSrc = src ? resolveImagePath(src) : "";

              return (
                <img
                  {...props}
                  src={resolvedSrc}
                  alt={alt}
                  role="button"
                  tabIndex={0}
                  aria-label={`放大图片：${alt || "行程图片"}`}
                  className="max-w-full h-auto rounded-lg shadow-md cursor-zoom-in hover:shadow-lg transition-shadow duration-200 my-4 block"
                  onClick={() => setPreviewImage({ src: resolvedSrc, alt })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setPreviewImage({ src: resolvedSrc, alt });
                    }
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const errorDiv = document.createElement("div");
                    errorDiv.className =
                      "p-4 bg-gray-100 rounded-lg text-center text-gray-500 my-4";
                    errorDiv.textContent = `图片加载失败: ${alt || "未知图片"}`;
                    target.parentNode?.insertBefore(errorDiv, target);
                  }}
                />
              );
            },
            // 自定义标题样式
            h1: ({ children, ...props }) => (
              <h1
                {...props}
                className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 text-left"
              >
                {children}
              </h1>
            ),
            h2: ({ node, children, ...props }) => (
              <h2
                {...props}
                id={toc.find(item => item.line === node?.position?.start.line)?.id}
                className="scroll-mt-4 text-2xl font-bold text-gray-900 mb-4 mt-8 text-left"
              >
                {children}
              </h2>
            ),
            h3: ({ node, children, ...props }) => (
              <h3
                {...props}
                id={toc.find(item => item.line === node?.position?.start.line)?.id}
                className="scroll-mt-4 text-xl font-semibold text-gray-900 mb-3 mt-6 text-left"
              >
                {children}
              </h3>
            ),
            h4: ({ children, ...props }) => (
              <h4
                {...props}
                className="text-lg font-medium text-gray-900 mb-2 mt-4 text-left"
              >
                {children}
              </h4>
            ),
            // 自定义段落样式
            p: ({ children, ...props }) => (
              <p
                {...props}
                className="text-gray-700 mb-4 text-left"
              >
                {children}
              </p>
            ),
            // 自定义代码块样式
            code: ({ node: _node, children, className, ...props }) => {
              const isTime = /^\d{1,2}:\d{2}(?:[–—~-]\d{1,2}:\d{2})?$/.test(String(children));
              return (
                <code {...props} className={[className, isTime ? "whitespace-nowrap" : ""].filter(Boolean).join(" ")}>
                  {children}
                </code>
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
            ul: ({ children, className, ...props }) => (
              <ul
                {...props}
                className={`list-disc list-outside ${className?.includes('contains-task-list') ? 'ml-0' : 'ml-6'} space-y-1 my-4 text-left`}
              >
                {children}
              </ul>
            ),
            ol: ({ node, children, ...props }) => {
              const start = node?.position?.start.line ?? 0;
              const heading = toc.filter((item) => item.line < start).at(-1);
              const entries = content.split("\n").slice(start - 1, node?.position?.end.line)
                .filter((line) => /^\d+[.)]\s/.test(line));
              const isTimeline = heading && /^\d{4}-\d{2}-\d{2}\b/.test(heading.text)
                && entries.length > 0 && entries.every((line) => /^\d+[.)]\s+(?:\*\*|__)?`[^`]+`/.test(line));
              return <ol {...props} className={isTimeline ? "trip-timeline" : "list-decimal list-outside ml-6 space-y-1 my-4 text-left"}>
                {children}
              </ol>;
            },
            // 自定义列表项样式
            li: ({ node, children, className, ...props }) => {
              const line = node?.position?.start.line ?? 0;
              const task = taskKeys[line - 1];
              if (task) {
                const storageKey = `travel:checklist:v2:${basePath}:${documentKey}:${task.key}`;
                const taskChildren = React.Children.toArray(children).flatMap((child) =>
                  React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === 'p'
                    ? React.Children.toArray(child.props.children)
                    : child
                );
                return (
                  <li {...props} className="task-item list-none text-gray-700">
                    <TaskCheckbox
                      key={storageKey}
                      storageKey={storageKey}
                      legacyPrefix={`travel:checklist:${basePath}:${documentKey}:`}
                      taskText={task.text}
                      occurrence={task.occurrence}
                      initialChecked={task.checked}
                      label={task.text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`]/g, '')}
                    />
                    {taskChildren}
                  </li>
                );
              }
              return <li {...props} className={`text-gray-700 ${className?.includes('task-list-item') ? 'list-none pl-0' : 'pl-2'}`}>{children}</li>;
            },
            // 自定义表格样式
            table: ({ node: _node, children, ...props }) => (
              <div className="markdown-table-scroll" role="region" aria-label="表格，可横向滚动" tabIndex={0}>
                <table {...props}>
                  {children}
                </table>
              </div>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* 图片预览模态框 */}
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={previewImage.alt}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
};
