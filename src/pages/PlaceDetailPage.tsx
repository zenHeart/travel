import { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MarkdownRenderer } from '../components/Markdown/MarkdownRenderer';
import { TableOfContents } from '../components/Navigation/TableOfContents';
import { PlaceNav } from '../components/Navigation/PlaceNav';
import { extractToc } from '../utils/toc';
import { places } from '../utils/placeScanner';

export function PlaceDetailPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLElement>(null);
  const place = places.find(item => item.id === placeId);
  const toc = useMemo(() => place ? extractToc(place.content) : [], [place]);

  if (!place) return <div className="flex h-screen items-center justify-center">找不到这个地点</div>;

  return <div className="flex h-screen flex-col bg-white">
    <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
      <button onClick={() => navigate('/')} className="text-sm text-slate-500">← 地图</button>
      <div className="h-4 w-px bg-slate-200" aria-hidden />
      <h1 className="font-semibold">{place.name}</h1>
      <span className="ml-auto text-xs text-slate-500">常驻地</span>
    </header>
    <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1">
      <aside className="hidden w-48 shrink-0 overflow-y-auto border-r border-slate-200 px-3 py-6 lg:block xl:w-56 2xl:w-64">
        <PlaceNav active="index" variant="rail" />
      </aside>
      <main ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
          <div className="mb-6 lg:hidden"><PlaceNav active="index" variant="collapse" /></div>
          <MarkdownRenderer content={place.content} basePath={`place/${place.id}`} documentKey="README.md" toc={toc} />
        </div>
      </main>
      <aside className="hidden w-56 shrink-0 overflow-y-auto py-6 pr-4 xl:block">
        <TableOfContents items={toc} scrollRef={scrollRef} resetKey={place.id} variant="rail" />
      </aside>
    </div>
  </div>;
}
