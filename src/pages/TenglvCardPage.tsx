import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenglvCard } from "../hooks/useTenglvCard";
import {
  TenglvCardEnvironment,
  TenglvCardItem,
  TenglvCardSection,
} from "../types/tenglvCard";

type SortKey = "region" | "name" | "marketPrice" | "usageLimit" | "visitCount";
type SortDirection = "asc" | "desc";
type VisitedFilter = "all" | "visited" | "unvisited";

const collator = new Intl.Collator("zh-Hans-CN");

const environmentLabels: Record<TenglvCardEnvironment, string> = {
  indoor: "室内",
  outdoor: "室外",
  mixed: "室内外",
  unknown: "待确认",
};

const sectionLabels: Record<TenglvCardSection, string> = {
  年卡权益: "年卡权益",
  增值福利: "增值福利",
};

function scenicSearchUrl(item: TenglvCardItem) {
  return `https://www.baidu.com/s?wd=${encodeURIComponent(`${item.region} ${item.name}`)}`;
}

function scenicLink(item: TenglvCardItem) {
  return item.websiteUrl || scenicSearchUrl(item);
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => collator.compare(a, b));
}

function usageLimitValue(value: TenglvCardItem["usageLimit"]) {
  if (typeof value === "number") {
    return value;
  }

  if (value === "不限") {
    return 9999;
  }

  if (value === "共享6次") {
    return 6;
  }

  return -1;
}

function compareItems(a: TenglvCardItem, b: TenglvCardItem, key: SortKey) {
  switch (key) {
    case "region":
      return collator.compare(a.region, b.region) || collator.compare(a.name, b.name);
    case "name":
      return collator.compare(a.name, b.name);
    case "marketPrice":
      return (a.marketPrice ?? -1) - (b.marketPrice ?? -1);
    case "usageLimit":
      return usageLimitValue(a.usageLimit) - usageLimitValue(b.usageLimit);
    case "visitCount":
      return a.visitCount - b.visitCount;
    default:
      return 0;
  }
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function EnvironmentBadge({ environment }: { environment: TenglvCardEnvironment }) {
  const className =
    environment === "indoor"
      ? "bg-indigo-50 text-indigo-700"
      : environment === "outdoor"
        ? "bg-emerald-50 text-emerald-700"
        : environment === "mixed"
          ? "bg-sky-50 text-sky-700"
          : "bg-amber-50 text-amber-700";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {environmentLabels[environment]}
    </span>
  );
}

function MiniProgramActions({
  shortLink,
  urlLink,
}: {
  shortLink?: string | null;
  urlLink?: string | null;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  if (!shortLink && !urlLink) {
    return null;
  }

  const handleCopy = async () => {
    if (!shortLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shortLink);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 md:items-end">
      {shortLink && (
        <div className="max-w-full truncate text-xs text-gray-500">{shortLink}</div>
      )}
      <div className="flex flex-wrap gap-2">
        {urlLink && (
          <a
            href={urlLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            打开小程序
          </a>
        )}
        {shortLink && (
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {copyState === "copied"
              ? "已复制"
              : copyState === "failed"
                ? "复制失败"
                : "复制小程序链接"}
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-600">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500"
      >
        {children}
      </select>
    </label>
  );
}

export const TenglvCardPage: React.FC = () => {
  const navigate = useNavigate();
  const card = useTenglvCard();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [section, setSection] = useState("all");
  const [environment, setEnvironment] = useState("all");
  const [tag, setTag] = useState("all");
  const [visitedFilter, setVisitedFilter] = useState<VisitedFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("region");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const regions = useMemo(
    () => uniqueSorted(card.items.map((item) => item.region)),
    [card.items]
  );
  const tags = useMemo(
    () => uniqueSorted(card.items.flatMap((item) => item.tags)),
    [card.items]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const matchedItems = card.items.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.region.toLowerCase().includes(normalizedSearch) ||
        item.tags.some((itemTag) => itemTag.toLowerCase().includes(normalizedSearch));
      const matchesRegion = region === "all" || item.region === region;
      const matchesSection = section === "all" || item.section === section;
      const matchesEnvironment =
        environment === "all" || item.environment === environment;
      const matchesTag = tag === "all" || item.tags.includes(tag);
      const matchesVisited =
        visitedFilter === "all" ||
        (visitedFilter === "visited" && item.visitCount > 0) ||
        (visitedFilter === "unvisited" && item.visitCount === 0);

      return (
        matchesSearch &&
        matchesRegion &&
        matchesSection &&
        matchesEnvironment &&
        matchesTag &&
        matchesVisited
      );
    });

    return matchedItems.sort((a, b) => {
      const result = compareItems(a, b, sortKey);
      return sortDirection === "asc" ? result : -result;
    });
  }, [card.items, environment, region, search, section, sortDirection, sortKey, tag, visitedFilter]);

  const stats = useMemo(
    () => ({
      total: card.items.length,
      visited: card.items.filter((item) => item.visitCount > 0).length,
      indoor: card.items.filter((item) => item.environment === "indoor").length,
      outdoor: card.items.filter((item) => item.environment === "outdoor").length,
      unknown: card.items.filter(
        (item) =>
          item.environment === "unknown" || item.classificationStatus === "unknown"
      ).length,
    }),
    [card.items]
  );

  return (
    <div className="h-screen overflow-y-auto bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 md:px-6">
        <header className="flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => navigate("/")}
              className="mb-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              返回首页
            </button>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {card.name}
            </h1>
            <div className="mt-1 text-sm text-gray-500">
              清单日期：{card.sourceDate}
            </div>
          </div>
          <MiniProgramActions
            shortLink={card.miniProgramShortLink}
            urlLink={card.miniProgramUrlLink}
          />
        </header>

        <section className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <StatTile label="总项目" value={stats.total} />
          <StatTile label="已去过" value={stats.visited} />
          <StatTile label="室内" value={stats.indoor} />
          <StatTile label="室外" value={stats.outdoor} />
          <StatTile label="待确认" value={stats.unknown} />
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 lg:grid-cols-8">
            <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-600 md:col-span-2">
              <span>搜索</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-blue-500"
                placeholder="名称、地区、标签"
              />
            </label>

            <SelectField label="地区" value={region} onChange={setRegion}>
              <option value="all">全部地区</option>
              {regions.map((itemRegion) => (
                <option key={itemRegion} value={itemRegion}>
                  {itemRegion}
                </option>
              ))}
            </SelectField>

            <SelectField label="权益" value={section} onChange={setSection}>
              <option value="all">全部权益</option>
              {Object.keys(sectionLabels).map((itemSection) => (
                <option key={itemSection} value={itemSection}>
                  {sectionLabels[itemSection as TenglvCardSection]}
                </option>
              ))}
            </SelectField>

            <SelectField label="场景" value={environment} onChange={setEnvironment}>
              <option value="all">全部场景</option>
              {Object.entries(environmentLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectField>

            <SelectField label="标签" value={tag} onChange={setTag}>
              <option value="all">全部标签</option>
              {tags.map((itemTag) => (
                <option key={itemTag} value={itemTag}>
                  {itemTag}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="到访"
              value={visitedFilter}
              onChange={(value) => setVisitedFilter(value as VisitedFilter)}
            >
              <option value="all">全部</option>
              <option value="visited">已去过</option>
              <option value="unvisited">未去过</option>
            </SelectField>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <SelectField
                label="排序"
                value={sortKey}
                onChange={(value) => setSortKey(value as SortKey)}
              >
                <option value="region">地区</option>
                <option value="name">名称</option>
                <option value="marketPrice">门市价</option>
                <option value="usageLimit">可用次数</option>
                <option value="visitCount">已去次数</option>
              </SelectField>
              <button
                onClick={() =>
                  setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
                }
                className="mt-5 h-10 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                {sortDirection === "asc" ? "升序" : "降序"}
              </button>
            </div>
          </div>
        </section>

        <div className="text-sm text-gray-600">
          当前显示 {filteredItems.length} / {card.items.length}
        </div>

        <section className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-3 text-left font-medium">地区</th>
                  <th className="px-3 py-3 text-left font-medium">景点</th>
                  <th className="px-3 py-3 text-left font-medium">权益</th>
                  <th className="px-3 py-3 text-left font-medium">场景</th>
                  <th className="px-3 py-3 text-left font-medium">价格</th>
                  <th className="px-3 py-3 text-left font-medium">A级</th>
                  <th className="px-3 py-3 text-left font-medium">次数</th>
                  <th className="px-3 py-3 text-left font-medium">已去</th>
                  <th className="px-3 py-3 text-left font-medium">标签</th>
                  <th className="px-3 py-3 text-left font-medium">链接</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">{item.region}</td>
                    <td className="min-w-56 px-3 py-3 font-medium text-gray-900">
                      {item.name}
                      <div className="mt-1 text-xs font-normal text-gray-500">
                        {item.benefitText}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                      {item.section}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <EnvironmentBadge environment={item.environment} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                      {item.marketPrice ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                      {item.rating ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                      {item.usageLimit}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                      {item.visitCount}
                    </td>
                    <td className="min-w-48 px-3 py-3">
                      <TagList tags={item.tags} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <a
                        href={scenicLink(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        查景点
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-3 md:hidden">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">
                    {item.region} · {item.section}
                  </div>
                  <h2 className="mt-1 text-base font-semibold text-gray-900">
                    {item.name}
                  </h2>
                </div>
                <EnvironmentBadge environment={item.environment} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <span className="block text-gray-400">价格</span>
                  {item.marketPrice ?? "-"}
                </div>
                <div>
                  <span className="block text-gray-400">次数</span>
                  {item.usageLimit}
                </div>
                <div>
                  <span className="block text-gray-400">已去</span>
                  {item.visitCount}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700">{item.benefitText}</div>
              <div className="mt-3">
                <TagList tags={item.tags} />
              </div>
              <a
                href={scenicLink(item)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-blue-700"
              >
                查景点
              </a>
            </article>
          ))}
        </section>

        {filteredItems.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center text-gray-500">
            无匹配项目
          </div>
        )}
      </div>
    </div>
  );
};
