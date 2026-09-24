import { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import { MarkdownContent } from '../components/Markdown/MarkdownContent';
import { DocNav } from '../components/Navigation/DocNav';
import { TableOfContents } from '../components/Navigation/TableOfContents';
import { extractToc } from '../utils/toc';

const statusText = { visited: '已访问', planned: '计划', wishlist: '心愿' };

export function TripDetailPage() {
  const { tripId, page = 'index' } = useParams();
  const navigate = useNavigate();
  const { getTripById } = useTrips();
  const scrollRef = useRef<HTMLElement>(null);
  const trip = tripId ? getTripById(tripId) : undefined;
  const files = useMemo(() => trip ? [trip.index, ...trip.pages] : [], [trip]);
  const current = files.find(file => file.slug === page);
  const toc = useMemo(() => current ? extractToc(current.content) : [], [current]);

  if (!trip || !current) {
    return <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-lg font-semibold">找不到这篇游记</h1>
      <button className="btn-primary" onClick={() => navigate('/')}>返回地图</button>
    </div>;
  }

  const selectFile = (name: string) => {
    const target = files.find(file => file.name === name);
    if (!target) return;
    scrollRef.current?.scrollTo({ top: 0 });
    navigate(`/${trip.id}/${target.slug}`);
  };

  return <div className="flex h-screen flex-col bg-white">
    <header className="z-10 flex-shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('/')} className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">← 地图</button>
        <div className="h-4 w-px bg-slate-200" aria-hidden />
        <h1 className="truncate text-base font-semibold text-slate-900">{trip.title}{page !== 'index' && ` / ${current.title}`}</h1>
        <span className="ml-auto shrink-0 text-xs text-slate-400">{statusText[trip.status]}</span>
      </div>
    </header>
    <div className="flex min-h-0 flex-1">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px]">
        <aside className="hidden shrink-0 overflow-y-auto border-r border-slate-200 px-3 py-6 lg:block lg:w-48 xl:w-56 2xl:w-64">
          <DocNav files={files} activeFile={current.name} onSelect={selectFile} variant="rail" />
        </aside>
        <main ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
            <div className="mb-6 space-y-2">
              <div className="lg:hidden"><DocNav files={files} activeFile={current.name} onSelect={selectFile} variant="collapse" /></div>
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
