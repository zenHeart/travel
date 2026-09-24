import yaml from 'js-yaml';
import type { Trip, TripDocument, TripMapPoint, TripStatus } from '../types/trip';

interface Frontmatter {
  type?: 'trip' | 'city' | 'note';
  title?: string;
  status?: TripStatus;
  start_date?: string;
  start_year?: string;
  date_hint?: string;
  chinese_name?: string;
  coordinates?: [number, number];
  nav_title?: string;
  order?: number;
}

const indexModules = import.meta.glob('/content/trip/*/README.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const pageModules = import.meta.glob('/content/trip/*/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function frontmatter(content: string): Frontmatter {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  return (yaml.load(match[1]) || {}) as Frontmatter;
}

function firstHeading(content: string): string | undefined {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim();
}

function validCoordinates(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && value.every(item => typeof item === 'number' && Number.isFinite(item));
}

function document(name: string, content: string, meta: Frontmatter): TripDocument {
  const slug = name === 'README.md' ? 'index' : name.replace(/\.md$/, '');
  return {
    name,
    slug,
    title: name === 'README.md' ? '总览' : (meta.nav_title || meta.chinese_name || firstHeading(content) || slug),
    content,
    order: meta.order ?? (name === 'README.md' ? 0 : Number.MAX_SAFE_INTEGER),
    kind: meta.type || (name === 'README.md' ? 'trip' : 'note'),
    cityName: meta.chinese_name,
    coordinates: validCoordinates(meta.coordinates) ? meta.coordinates : undefined,
  };
}

export function scanTrips(): Trip[] {
  return Object.entries(indexModules).map(([path, raw]) => {
    const id = path.split('/')[3];
    const content = raw as string;
    const meta = frontmatter(content);
    if (meta.type !== 'trip' || !meta.title || !meta.status) {
      throw new Error(`${path} 缺少 type: trip、title 或 status`);
    }

    const index = document('README.md', content, meta);
    const pages = Object.entries(pageModules)
      .filter(([pagePath]) => pagePath.startsWith(`/content/trip/${id}/`) && pagePath !== path)
      .map(([pagePath, pageRaw]) => {
        const pageContent = pageRaw as string;
        return document(pagePath.split('/').at(-1)!, pageContent, frontmatter(pageContent));
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    const title = meta.title;
    const status = meta.status;
    const points: TripMapPoint[] = [index, ...pages]
      .filter(page => (page.name === 'README.md' || page.kind === 'city') && page.cityName && page.coordinates)
      .map(page => ({
        id: `${id}/${page.slug}`,
        label: page.cityName!,
        coordinates: page.coordinates!,
        status,
        path: `/${id}/${page.slug}`,
        tripId: id,
        tripTitle: title,
      }));

    return { id, title, status, startDate: meta.start_date, startYear: meta.start_year, dateHint: meta.date_hint, index, pages, points };
  }).sort((a, b) => (b.startDate || b.startYear || '').localeCompare(a.startDate || a.startYear || '') || a.title.localeCompare(b.title));
}
