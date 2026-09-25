import { useLayoutEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import { MarkdownContent } from '../components/Markdown/MarkdownContent';
import { DocNav } from '../components/Navigation/DocNav';
import { TableOfContents } from '../components/Navigation/TableOfContents';
import { extractToc } from '../utils/toc';

const statusText = { visited: '已访问', planned: '计划', wishlist: '心愿' };

export function TripDetailPage() {
  const { tripId, '*': nestedPage } = useParams();
  const page = nestedPage || 'index';
  const navigate = useNavigate();
  const { hash, key: locationKey } = useLocation();
  const { getTripById } = useTrips();
  const scrollRef = useRef<HTMLElement>(null);
  const trip = tripId ? getTripById(tripId) : undefined;
  const files = useMemo(() => trip ? [trip.index, ...trip.pages] : [], [trip]);
  const current = files.find(file => file.slug === page);
  const parent = current?.slug.includes('/') ? files.find(file => file.slug === current.slug.slice(0, current.slug.lastIndexOf('/'))) : undefined;
  const toc = useMemo(() => current ? extractToc(current.content) : [], [current]);

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const id = hash ? decodeURIComponent(hash.slice(1)) : '';
    const heading = id ? root.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
    if (heading) heading.scrollIntoView({ block: 'start' });
    else root.scrollTo({ top: 0 });
  }, [tripId, current?.name, hash, locationKey]);

  if (!trip || !current) {
    return <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-lg font-semibold">找不到这篇游记</h1>
      <button className="btn-primary" onClick={() => navigate('/')}>返回地图</button>
    </div>;
  }

  return <div className="flex h-dvh flex-col bg-white">
    <header className="z-10 flex-shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-md px-2 text-sm text-slate-600 hover:bg-slate-100">← 地图</Link>
        <div className="h-4 w-px bg-slate-200" aria-hidden />
        <p className="min-w-0 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">{trip.title}{parent && ` / ${parent.title}`}{page !== 'index' && ` / ${current.title}`}</p>
        <span className="ml-auto shrink-0 text-xs text-slate-500">{statusText[trip.status]}</span>
      </div>
    </header>
    <div className="flex min-h-0 flex-1">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px]">
        <aside className="hidden shrink-0 overflow-y-auto border-r border-slate-200 px-3 py-6 lg:block lg:w-48 xl:w-56 2xl:w-64">
          <DocNav files={files} activeFile={current.name} basePath={trip.id} variant="rail" />
        </aside>
        <main ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 lg:py-8">
            <div className="mb-6 space-y-2 xl:hidden">
              <div className="lg:hidden"><DocNav files={files} activeFile={current.name} basePath={trip.id} variant="collapse" /></div>
              <div className="xl:hidden"><TableOfContents items={toc} scrollRef={scrollRef} resetKey={current.name} variant="collapse" /></div>
            </div>
            <MarkdownContent files={files} activeFile={current.name} toc={toc} basePath={trip.id} />
          </div>
        </main>
        <aside className="hidden shrink-0 overflow-y-auto py-6 pr-4 xl:block xl:w-56 2xl:w-64">
          <TableOfContents items={toc} scrollRef={scrollRef} resetKey={current.name} variant="rail" />
        </aside>
      </div>
    </div>
  </div>;
}
