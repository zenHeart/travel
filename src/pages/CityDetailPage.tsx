import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCities } from '../hooks/useCities';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { MarkdownContent } from '../components/Markdown/MarkdownContent';
import { DocNav } from '../components/Navigation/DocNav';
import { TableOfContents } from '../components/Navigation/TableOfContents';
import { extractToc } from '../utils/toc';

const STATUS_TEXT = {
  visited: '已访问',
  planned: '计划中',
  wishlist: '愿望清单',
} as const;

export const CityDetailPage: React.FC = () => {
  const { id, file } = useParams<{ id: string; file?: string }>();
  const navigate = useNavigate();
  const { getCityById, loading } = useCities();
  const scrollRef = useRef<HTMLElement>(null);
  const [activeFile, setActiveFile] = useState<string>('');

  const city = id && !loading ? getCityById(id) : undefined;
  const allFiles = useMemo(
    () => (city ? [city.files.index, ...city.files.related] : []),
    [city]
  );

  // 路由 :file 决定当前文档；没带就用 index
  useEffect(() => {
    if (!allFiles.length) return;
    const target = file ? `${file}.md` : 'index.md';
    const hit = allFiles.find((f) => f.name === target) || allFiles[0];
    setActiveFile(hit.name);
  }, [file, allFiles]);

  // 切换文档时同步 URL，保证可分享、可后退
  const selectFile = (fileName: string) => {
    if (!city) return;
    setActiveFile(fileName);
    scrollRef.current?.scrollTo({ top: 0 });
    navigate(
      fileName === 'index.md'
        ? `/city/${city.id}`
        : `/city/${city.id}/${fileName.replace(/\.md$/, '')}`
    );
  };

  const currentFile = allFiles.find((f) => f.name === activeFile) || allFiles[0];
  const toc = useMemo(
    () => (currentFile ? extractToc(currentFile.content) : []),
    [currentFile]
  );

  if (loading) return <LoadingSpinner message="正在加载城市信息..." />;

  if (!city) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">找不到这个城市</h1>
        <p className="text-slate-500">地址可能已经变了，回首页从地图上重新选一个。</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          回首页
        </button>
      </div>
    );
  }

  const subLocation = file
    ? city.subLocations.find((sub) => sub.slug === file)
    : undefined;
  const basePath = `${city.status}/${city.id}`;

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* 顶栏 */}
      <header className="z-10 flex-shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-md px-2 py-1 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            ← 地图
          </button>
          <div className="h-4 w-px bg-slate-200" aria-hidden />
          <h1 className="truncate text-base font-semibold text-slate-900">
            {city.name}
            {subLocation && (
              <span className="font-normal text-slate-400"> / {subLocation.name}</span>
            )}
          </h1>
          <span className="ml-auto shrink-0 text-xs text-slate-400">
            {STATUS_TEXT[city.status]}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="mx-auto flex min-h-0 w-full max-w-[1600px]">
          {/* 左：文章导航 */}
          <aside className="hidden shrink-0 overflow-y-auto border-r border-slate-200 px-3 py-6 lg:block lg:w-48 xl:w-56 2xl:w-64">
            <DocNav
              files={allFiles}
              activeFile={activeFile}
              onSelect={selectFile}
              variant="rail"
            />
          </aside>

          {/* 中：正文 */}
          <main ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
              <div className="mb-6 space-y-2">
                <div className="lg:hidden">
                  <DocNav
                    files={allFiles}
                    activeFile={activeFile}
                    onSelect={selectFile}
                    variant="collapse"
                  />
                </div>
                <div className="xl:hidden">
                  <TableOfContents
                    items={toc}
                    scrollRef={scrollRef}
                    resetKey={activeFile}
                    variant="collapse"
                  />
                </div>
              </div>

              <MarkdownContent
                files={allFiles}
                activeFile={activeFile}
                toc={toc}
                basePath={basePath}
              />

              {city.id === 'wuhan' && (
                <div className="mt-10 rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-base font-semibold text-slate-900">
                      武汉都市圈 T 卡
                    </h2>
                    <button
                      onClick={() => navigate('/cards/wuhan-tenglv')}
                      className="btn-primary btn-mobile"
                    >
                      查看权益表
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* 右：内容导航 */}
          <aside className="hidden shrink-0 overflow-y-auto py-6 pr-4 xl:block xl:w-56 2xl:w-64">
            <TableOfContents
              items={toc}
              scrollRef={scrollRef}
              resetKey={activeFile}
              variant="rail"
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
