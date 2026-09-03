import React from 'react';
import { MarkdownFile } from '../../types/city';
import { NavPanel } from './NavPanel';

interface DocNavProps {
  files: MarkdownFile[];
  activeFile: string;
  onSelect: (fileName: string) => void;
  variant: 'rail' | 'collapse';
}

/** 文章导航：在同一城市的多篇文档之间切换。始终纵向。 */
export const DocNav: React.FC<DocNavProps> = ({
  files,
  activeFile,
  onSelect,
  variant,
}) => {
  if (files.length <= 1) return null;

  const current = files.find((f) => f.name === activeFile);

  return (
    <NavPanel label="行程分页" summary={current?.title} variant={variant}>
      <ul className="space-y-0.5">
        {files.map((f) => {
          const active = f.name === activeFile;
          return (
            <li key={f.name}>
              <button
                onClick={() => onSelect(f.name)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex w-full items-stretch gap-2 rounded-md py-2 pr-2 text-left transition-colors lg:py-1.5',
                  active
                    ? 'bg-teal-50 text-teal-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                ].join(' ')}
              >
                <span
                  aria-hidden
                  className={[
                    'w-0.5 shrink-0 rounded-full',
                    active ? 'bg-teal-600' : 'bg-transparent',
                  ].join(' ')}
                />
                <span
                  className={[
                    'min-w-0 truncate text-sm',
                    active ? 'font-semibold' : 'font-normal',
                  ].join(' ')}
                >
                  {f.title || f.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </NavPanel>
  );
};
