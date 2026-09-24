import React from 'react';
import { TripDocument } from '../../types/trip';
import { NavPanel } from './NavPanel';

interface DocNavProps {
  files: TripDocument[];
  activeFile: string;
  onSelect: (fileName: string) => void;
  variant: 'rail' | 'collapse';
}

/** 同一游记的总览、城市和附录分页。 */
export const DocNav: React.FC<DocNavProps> = ({
  files,
  activeFile,
  onSelect,
  variant,
}) => {
  if (files.length <= 1) return null;

  const current = files.find((f) => f.name === activeFile);
  const childrenOf = (parent?: TripDocument) => files.filter((file) => {
    if (!parent) return !file.slug.includes('/');
    const prefix = `${parent.slug}/`;
    return file.slug.startsWith(prefix) && !file.slug.slice(prefix.length).includes('/');
  });
  const renderPages = (parent?: TripDocument) => (
    <ul className={parent ? 'ml-3 border-l border-slate-200 pl-2' : 'space-y-0.5'}>
      {childrenOf(parent).map((file) => {
        const active = file.name === activeFile;
        const parentActive = current?.slug.startsWith(`${file.slug}/`);
        return (
          <li key={file.name}>
            <button
              onClick={() => onSelect(file.name)}
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
                className={['w-0.5 shrink-0 rounded-full', active ? 'bg-teal-600' : 'bg-transparent'].join(' ')}
              />
              <span className={['min-w-0 truncate text-sm', active ? 'font-semibold' : parentActive ? 'font-medium text-teal-800' : 'font-normal'].join(' ')}>
                {file.title || file.name}
              </span>
            </button>
            {childrenOf(file).length > 0 && renderPages(file)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <NavPanel label="行程分页" summary={current?.title} variant={variant}>
      {renderPages()}
    </NavPanel>
  );
};
