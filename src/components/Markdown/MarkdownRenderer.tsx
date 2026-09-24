import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import { useNavigate } from "react-router-dom";
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
  initialChecked: boolean;
  label: string;
}> = ({ storageKey, initialChecked, label }) => {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === null ? initialChecked : saved === "1";
    } catch {
      return initialChecked;
    }
  });

  return (
    <input
      type="checkbox"
      checked={checked}
      aria-label={label}
      className="mr-2 accent-teal-600"
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
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  basePath = "",
  documentKey = "",
  toc = [],
}) => {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
  } | null>(null);

  const tripId = basePath.split("/").at(-1) || "";

  const handleInternalLink = (href: string) => {
    // [[城市ID]] 或 [[城市ID|显示文本]]
    const wiki = href.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
    if (wiki) {
      navigate(`/${wiki[1]}/index`);
      return;
    }

    // 页内锚点
    if (href.startsWith("#")) {
      const el = document.getElementById(decodeURIComponent(href.slice(1)));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // 同一游记的相对文档路径，可指向子页或从子页返回城市页。
    const sibling = href.match(/^(?:\.\/|\.\.\/)[^#?]+\.md(?:#.*)?$/);
    if (sibling && tripId) {
      const slug = new URL(href, `https://trip.local/${documentKey}`).pathname.slice(1).replace(/\.md$/, "");
      navigate(`/${tripId}/${slug === "README" ? "index" : slug}`);
      return;
    }

    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
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
              const resolvedSrc = src ? resolveImagePath(src) : "";

              return (
                <img
                  {...props}
                  src={resolvedSrc}
                  alt={alt}
                  className="max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 my-4 block"
                  onClick={() => setPreviewImage({ src: resolvedSrc, alt })}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const errorDiv = document.createElement("div");
                    errorDiv.className =
                      "p-4 bg-gray-100 rounded-lg text-center text-gray-500 my-4";
                    errorDiv.textContent = `图片加载失败: ${alt || "未知图片"}`;
                    target.parentNode?.insertBefore(errorDiv, target);
                  }}
                  onLoad={() => {
                    console.log("图片加载成功:", resolvedSrc);
                  }}
                />
              );
            },
            // 自定义标题样式
            h1: ({ children, ...props }) => (
              <h1
                {...props}
                className="text-3xl font-bold text-gray-900 mb-6 mt-8 text-left"
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
                className="text-gray-700 leading-relaxed mb-4 text-left"
              >
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
              <ul
                {...props}
                className="list-disc list-outside ml-6 space-y-1 my-4 text-left"
              >
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol
                {...props}
                className="list-decimal list-outside ml-6 space-y-1 my-4 text-left"
              >
                {children}
              </ol>
            ),
            // 自定义列表项样式
            li: ({ node, children, className, ...props }) => {
              const line = node?.position?.start.line ?? 0;
              const source = content.split("\n")[line - 1] ?? "";
              const task = source.match(/^\s*(?:[-*+]|\d+[.)]) \[([ xX])\]\s+(.+)$/);
              if (task) {
                const storageKey = `travel:checklist:${basePath}:${documentKey}:${line}:${task[2]}`;
                const taskChildren = React.Children.toArray(children).flatMap((child) =>
                  React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === 'p'
                    ? React.Children.toArray(child.props.children)
                    : child
                );
                return (
                  <li {...props} className="task-item list-none text-gray-700 leading-relaxed">
                    <TaskCheckbox
                      storageKey={storageKey}
                      initialChecked={task[1].toLowerCase() === 'x'}
                      label={task[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')}
                    />
                    {taskChildren}
                  </li>
                );
              }
              return <li {...props} className={`text-gray-700 leading-relaxed ${className?.includes('task-list-item') ? 'list-none pl-0' : 'pl-2'}`}>{children}</li>;
            },
            // 自定义表格样式
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table {...props} className="min-w-full border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th
                {...props}
                className="border border-gray-300 px-4 py-2 bg-gray-100 font-medium text-left"
              >
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td
                {...props}
                className="border border-gray-300 px-4 py-2 text-left"
              >
                {children}
              </td>
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
