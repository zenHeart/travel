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
    url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTUgNkwyMSAxMkwyMSAxOEgxNVYxMkg5VjE4SDNWMTJMOSAxMloiIGZpbGw9IiMxMEI5ODEiLz4KPC9zdmc+",
    size: [24, 24],
    anchor: [12, 12],
  },
  planned: {
    url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiNGNTlFMEIiLz4KPHBhdGggZD0iTTEyIDZWN0gxMlY2Wk0xMiA4VjEwSDEyVjhNMTIgMTFWMTNIMTJWMU0xMiAxNFYxNkgxMlYxNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==",
    size: [24, 24],
    anchor: [12, 12],
  },
  wishlist: {
    url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDIxLjM1TDEwLjU1IDIwLjAzQzUuNCAxNS4zNiAyIDEyLjI3IDIgOC41QzIgNS40MSA0LjQyIDMgNy41IDNDOS4yNCAzIDEwLjkxIDMuODEgMTIgNS4wOEMxMy4wOSAzLjgxIDE0Ljc2IDMgMTYuNSAzQzE5LjU4IDMgMjIgNS40MSAyMiA4LjVDMjIgMTIuMjcgMTguNiAxNS4zNiAxMy40NSAyMC4wNEwxMiAyMS4zNVoiIGZpbGw9IiMzQjgyRjYiLz4KPC9zdmc+",
    size: [24, 24],
    anchor: [12, 12],
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
