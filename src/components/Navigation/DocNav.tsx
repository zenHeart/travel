import React from 'react';
import { Link } from 'react-router-dom';
import { TripDocument } from '../../types/trip';
import { NavPanel } from './NavPanel';

interface DocNavProps {
  files: TripDocument[];
  activeFile: string;
  basePath: string;
  variant: 'rail' | 'collapse';
}

/** 同一游记的总览、城市和附录分页。 */
export const DocNav: React.FC<DocNavProps> = ({
  files,
  activeFile,
  basePath,
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
            <Link
              to={`/${basePath}/${file.slug}`}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex min-h-11 w-full items-center gap-2 rounded-md py-2 pr-2 text-left transition-colors lg:min-h-0 lg:py-2',
                active
                  ? 'bg-teal-50 text-teal-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')}
            >
              <span
                aria-hidden
                className={['w-0.5 shrink-0 self-stretch rounded-full', active ? 'bg-teal-600' : 'bg-transparent'].join(' ')}
              />
              <span className={['min-w-0 text-sm leading-relaxed', active ? 'font-semibold' : parentActive ? 'font-medium text-teal-800' : 'font-normal'].join(' ')}>
                {file.title || file.name}
              </span>
            </Link>
            {childrenOf(file).length > 0 && renderPages(file)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <NavPanel label="行程导航" summary={current?.title} variant={variant}>
      {renderPages()}
    </NavPanel>
  );
};
