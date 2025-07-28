import { City, MarkdownFile, InternalLink, ImageFile, CityFrontmatter } from "../types/city";
import yaml from 'js-yaml';

export class ContentScanner {
  cities: City[] = [];

  async scanContent(): Promise<City[]> {
    try {
      console.log('开始扫描城市内容...');
      
      // 扫描已访问城市
      const visitedCities = await this.scanCityDirectory('visited');
      console.log('已访问城市:', visitedCities.length);
      
      // 扫描愿望清单城市
      const wishlistCities = await this.scanCityDirectory('wishlist');
      console.log('愿望清单城市:', wishlistCities.length);
      
      // 合并所有城市
      this.cities = [...visitedCities, ...wishlistCities];
      console.log('总城市数:', this.cities.length);
      
      return this.cities;
    } catch (error) {
      console.error('扫描内容时出错:', error);
      throw new Error('无法扫描城市内容');
    }
  }

  private async scanCityDirectory(status: 'visited' | 'wishlist'): Promise<City[]> {
    const cities: City[] = [];
    
    try {
      // 使用更精确的glob模式来匹配index.md文件
      const contentModules = import.meta.glob('/content/cities/*/*/index.md', { 
        eager: true,
        as: 'raw'
      });

      console.log(`扫描${status}城市，找到${Object.keys(contentModules).length}个文件:`);
      console.log('文件路径:', Object.keys(contentModules));

      for (const [path, content] of Object.entries(contentModules)) {
        const pathParts = path.split('/');
        const fileStatus = pathParts[3] as 'visited' | 'wishlist';
        const cityId = pathParts[4];
        
        console.log(`处理文件: ${path}, 状态: ${fileStatus}, 城市ID: ${cityId}`);
        
        if (cityId && content && fileStatus === status) {
          const city = await this.buildCityData(cityId, status, content as string);
          if (city) {
            cities.push(city);
            console.log(`成功添加城市: ${city.name}`);
          }
        }
      }
    } catch (error) {
      console.error(`扫描${status}城市时出错:`, error);
    }

    return cities;
  }

  private async buildCityData(cityId: string, status: 'visited' | 'wishlist', indexContent: string): Promise<City | null> {
    try {
      // 解析 frontmatter
      const frontmatter = this.parseFrontmatter(indexContent);
      
      // 必须从 frontmatter 获取所有基础信息
      const cityName = frontmatter.chinese_name;
      const englishName = frontmatter.english_name;
      const coordinates = frontmatter.coordinates;

      if (!cityName) {
        console.warn(`城市 ${cityId} 缺少中文名称 (chinese_name)`);
        return null;
      }

      if (!englishName) {
        console.warn(`城市 ${cityId} 缺少英文名称 (english_name)`);
        return null;
      }

      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        console.warn(`城市 ${cityId} 缺少或格式错误的坐标信息 (coordinates)`);
        return null;
      }

      // 读取主文件
      const indexFile: MarkdownFile = {
        name: 'index.md',
        path: `/content/cities/${status}/${cityId}/index.md`,
        title: '主要攻略',
        content: indexContent,
        lastModified: new Date().toISOString()
      };

      // 尝试读取相关文件
      const relatedFiles: MarkdownFile[] = [];
      try {
        const detailModules = import.meta.glob('/content/cities/*/*/detail.md', { 
          eager: true,
          as: 'raw'
        });
        
        const detailPath = `/content/cities/${status}/${cityId}/detail.md`;
        if (detailModules[detailPath]) {
          relatedFiles.push({
            name: 'detail.md',
            path: `/content/cities/${status}/${cityId}/detail.md`,
            title: '详细攻略',
            content: detailModules[detailPath] as string,
            lastModified: new Date().toISOString()
          });
        }
      } catch {
        // 如果没有detail.md文件，忽略错误
      }

      // 读取图片文件
      const imageFiles: ImageFile[] = [];
      try {
        // 使用更精确的glob模式来匹配图片文件
        const imageModules = import.meta.glob('/content/cities/*/*/*.{jpg,jpeg,png,gif,webp}', { 
          eager: true,
          as: 'url'
        });

        for (const [imagePath, imageUrl] of Object.entries(imageModules)) {
          const pathParts = imagePath.split('/');
          const imageStatus = pathParts[3] as 'visited' | 'wishlist';
          const imageCityId = pathParts[4];
          
          if (imageCityId === cityId && imageStatus === status) {
            const fileName = pathParts[5];
            imageFiles.push({
              name: fileName,
              path: `/content/cities/${status}/${cityId}/${fileName}`,
              url: imageUrl as string,
              type: 'image'
            });
          }
        }
      } catch (error) {
        console.warn(`读取图片文件时出错:`, error);
      }

      // 解析内部链接
      const internalLinks = this.parseInternalLinks(indexContent);

      // 提取元数据 - 优先级：frontmatter > 内容解析 > 默认值
      const visitDate = frontmatter.visit_date || this.extractVisitDate(indexContent);
      const duration = frontmatter.duration || this.extractDuration(indexContent);
      const tags = frontmatter.tags || this.extractTags(indexContent);
      const summary = this.extractSummary(indexContent);
      const highlights = this.extractHighlights(indexContent);
      const budget = this.extractBudget(indexContent);

      const city: City = {
        id: cityId,
        name: cityName,
        englishName: englishName,
        coordinates: coordinates,
        status: status,
        visitDate: visitDate,
        duration: duration,
        tags: tags,
        summary: summary,
        highlights: highlights,
        budget: budget,
        contentPath: `/content/cities/${status}/${cityId}`,
        files: {
          index: indexFile,
          related: relatedFiles,
          images: imageFiles
        },
        links: {
          internal: internalLinks,
          external: []
        }
      };

      return city;
    } catch (error) {
      console.error(`构建城市数据时出错 (${cityId}):`, error);
      return null;
    }
  }

  /**
   * 解析 Markdown 文件的 YAML frontmatter
   * @param content Markdown 文件内容
   * @returns 解析后的 frontmatter 对象
   */
  private parseFrontmatter(content: string): CityFrontmatter {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      try {
        const frontmatter = yaml.load(match[1]) as CityFrontmatter;
        console.log('解析到 frontmatter:', frontmatter);
        return frontmatter || {};
      } catch (error) {
        console.warn('解析 frontmatter 失败:', error);
        return {};
      }
    }
    
    return {};
  }

  private parseInternalLinks(content: string): InternalLink[] {
    const links: InternalLink[] = [];
    const linkRegex = /\[([^\]]+)\]\(\.\/([^)]+\.md)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        target: match[2],
        path: match[2]
      });
    }

    return links;
  }

  private extractVisitDate(content: string): string | undefined {
    const dateRegex = /`time`\s*([^\s`]+)/;
    const match = content.match(dateRegex);
    return match ? match[1] : undefined;
  }

  private extractDuration(content: string): string | undefined {
    const durationRegex = /`duration`\s*([^\s`]+)/;
    const match = content.match(durationRegex);
    return match ? match[1] : undefined;
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const tagRegex = /`tag`\s*([^\s`]+)/g;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return tags;
  }

  private extractSummary(content: string): string {
    // 提取第一段作为摘要
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > 0) {
      return paragraphs[0].replace(/^#\s+/, '').trim();
    }
    return '暂无摘要';
  }

  private extractHighlights(content: string): string[] {
    const highlights: string[] = [];
    const highlightRegex = /`highlight`\s*([^\s`]+)/g;
    let match;

    while ((match = highlightRegex.exec(content)) !== null) {
      highlights.push(match[1]);
    }

    return highlights;
  }

  private extractBudget(content: string): string | undefined {
    const budgetRegex = /`budget`\s*([^\s`]+)/;
    const match = content.match(budgetRegex);
    return match ? match[1] : undefined;
  }

  getCitiesByStatus(status: 'visited' | 'planned' | 'wishlist'): City[] {
    return this.cities.filter(city => city.status === status);
  }

  getCityById(id: string): City | undefined {
    return this.cities.find(city => city.id === id);
  }
} 