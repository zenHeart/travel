import React, { useState } from 'react';

interface NavPanelProps {
  label: string;
  /** 折叠入口优先显示的当前项；label 保留为无障碍名称 */
  summary?: string;
  variant: 'rail' | 'collapse';
  children: React.ReactNode;
}

/**
 * 导航容器：统一「大屏常驻竖列 / 小屏点击展开」两种形态。
 * 两种形态下列表本身都是纵向，只是宽度与是否折叠不同。
 */
export const NavPanel: React.FC<NavPanelProps> = ({
  label,
  summary,
  variant,
  children,
}) => {
  const [open, setOpen] = useState(false);

  if (variant === 'rail') {
    return (
      <nav aria-label={label}>
        {children}
      </nav>
    );
  }

  return (
    <nav aria-label={label} className="rounded-lg border border-slate-200">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={summary ? `${label}：${summary}` : label}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"
      >
        <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
          {summary || label}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className={[
            'ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        >
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          className="max-h-[60vh] overflow-y-auto border-t border-slate-100 px-2 py-2"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </nav>
  );
};
