/**
 * JSAPI 示例 https://lbs.amap.com/demo/list/js-api-v2
 */
export const MAP_CONFIG = {
  // 中国中心点
  center: [114.304569, 30.593354] as [number, number],
  zoom: 4, // 调整为城市级别显示
  // 高德地图API配置
  apiKey: import.meta.env.VITE_AMAP_API_KEY || "your-amap-api-key", // 从环境变量获取
  version: "2.0",
  plugins: ["AMap.Geolocation"], // 只保留定位插件
  // 安全配置
  securityJsCode: import.meta.env.VITE_AMAP_SECURITY_JS_CODE || "", // 安全密钥
  // 地图样式配置
  mapStyle: {
    normal: "amap://styles/normal",
    satellite: "amap://styles/satellite", // 卫星图
    dark: "amap://styles/dark",
    light: "amap://styles/light",
  },
  // 限制配置
  restrictions: {
    minZoom: 3,
    maxZoom: 18,
    bounds: [
      [18.0, 73.0], // 西南角
      [54.0, 135.0], // 东北角
    ],
  },
};

export const MARKER_ICONS = {
  visited: {
    url:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="37" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
        <path d="M16 2C10.477 2 6 6.477 6 12C6 20 16 36 16 36S26 20 26 12C26 6.477 21.523 2 16 2Z" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="12" r="6" fill="#ffffff" fill-opacity="0.9"/>
        <path d="M13 12L15 14L19 10" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
    size: [32, 40],
    anchor: [16, 40],
    color: "#10B981",
  },
  planned: {
    url:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="37" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
        <path d="M16 2C10.477 2 6 6.477 6 12C6 20 16 36 16 36S26 20 26 12C26 6.477 21.523 2 16 2Z" fill="#F59E0B" stroke="#ffffff" stroke-width="2"/>
        <rect x="12" y="8" width="8" height="8" rx="1" fill="#ffffff" fill-opacity="0.9"/>
        <rect x="13" y="10" width="6" height="1" fill="#F59E0B"/>
        <rect x="13" y="12" width="4" height="1" fill="#F59E0B"/>
        <rect x="13" y="14" width="5" height="1" fill="#F59E0B"/>
      </svg>
    `),
    size: [32, 40],
    anchor: [16, 40],
    color: "#F59E0B",
  },
  wishlist: {
    url:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="37" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
        <path d="M16 2C10.477 2 6 6.477 6 12C6 20 16 36 16 36S26 20 26 12C26 6.477 21.523 2 16 2Z" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
        <path d="M16 15.5L13 13L11.5 14.5L16 19L20.5 14.5L19 13L16 15.5Z" fill="#ffffff"/>
        <path d="M16 9.5L19 7L20.5 8.5L16 13L11.5 8.5L13 7L16 9.5Z" fill="#ffffff"/>
      </svg>
    `),
    size: [32, 40],
    anchor: [16, 40],
    color: "#3B82F6",
  },
};

// 地图安全配置
export const MAP_SECURITY_CONFIG = {
  // 域名白名单（生产环境）
  allowedDomains: [
    "localhost",
    "127.0.0.1",
    "blog.zenheart.site",
    "travel.zenheart.site",
  ],
  // API调用限制
  rateLimit: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
  },
  // 错误重试配置
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};
