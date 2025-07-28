export interface City {
  id: string;
  name: string;
  englishName: string;
  coordinates: [number, number];
  status: "visited" | "planned" | "wishlist";
  visitDate?: string;
  duration?: string;
  tags: string[];
  coverImage?: string;
  summary: string;
  highlights: string[];
  budget?: string;
  contentPath: string;
  files: {
    index: MarkdownFile;
    related: MarkdownFile[];
    images: ImageFile[];
  };
  links: {
    internal: InternalLink[];
    external: ExternalLink[];
  };
  metadata?: CityMetadata;
}

export interface MarkdownFile {
  name: string;
  path: string;
  content: string;
  metadata?: Record<string, unknown>;
  title?: string;
  lastModified?: string;
}

export interface InternalLink {
  text: string;
  target: string;
  path: string;
}

export interface ExternalLink {
  text: string;
  url: string;
}

export interface ImageFile {
  name: string;
  path: string;
  url: string;
  type?: string;
}

export interface CityMetadata {
  title?: string;
  tags?: string[];
  date?: string;
  layout?: string;
}

// 新增：城市 frontmatter 配置接口
export interface CityFrontmatter {
  chinese_name?: string;
  english_name?: string;
  coordinates?: [number, number];
  visit_date?: string;
  duration?: string;
  tags?: string[];
  title?: string;
  date?: string;
  layout?: string;
  status?: "visited" | "planned" | "wishlist";
}
