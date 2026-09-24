import yaml from 'js-yaml';

export interface Place {
  id: string;
  name: string;
  coordinates: [number, number];
  content: string;
}

const modules = import.meta.glob('/content/place/*/README.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const places: Place[] = Object.entries(modules).map(([path, raw]) => {
  const content = raw as string;
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = (match ? yaml.load(match[1]) : null) as {
    type?: string;
    chinese_name?: string;
    coordinates?: [number, number];
  } | null;
  if (meta?.type !== 'place' || !meta.chinese_name || !Array.isArray(meta.coordinates) || meta.coordinates.length !== 2) {
    throw new Error(`${path} 缺少常驻地 frontmatter`);
  }
  return { id: path.split('/')[3], name: meta.chinese_name, coordinates: meta.coordinates, content };
});
