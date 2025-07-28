import { useState, useCallback, useEffect, useRef } from "react";
import { City } from "../types/city";
import { MapState, CityMarker } from "../types/map";
import { MAP_CONFIG } from "../constants/map";
import { MARKER_ICONS } from "../constants/map";

// 地图安全验证
const validateMapSecurity = () => {
  const apiKey = import.meta.env.VITE_AMAP_API_KEY;

  if (!apiKey) {
    console.error("高德地图API密钥未配置");
    return false;
  }

  return true;
};

// 检查地图容器
const checkMapContainer = (): boolean => {
  const container = document.getElementById("map-container");
  if (!container) {
    console.error("地图容器不存在");
    return false;
  }
  return true;
};

// 获取最近访问的城市
const getMostRecentVisitedCity = (cities: City[]): City | null => {
  const visitedCities = cities.filter((city) => city.status === "visited");
  if (visitedCities.length === 0) return null;

  // 按访问日期排序，返回最近访问的城市
  return visitedCities.sort((a, b) => {
    const dateA = a.visitDate ? new Date(a.visitDate).getTime() : 0;
    const dateB = b.visitDate ? new Date(b.visitDate).getTime() : 0;
    return dateB - dateA;
  })[0];
};

export function useMap() {
  const [mapState, setMapState] = useState<MapState>({
    isLoaded: false,
    isLoading: false,
    error: null,
    markers: [],
    selectedMarker: null,
  });

  const [mapInstance, setMapInstance] = useState<unknown>(null);
  const [retryCount, setRetryCount] = useState(0);
  const initAttempted = useRef(false);
  const componentMounted = useRef(false);
  const [cities, setCities] = useState<City[]>([]);

  // 组件挂载状态管理
  useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // 初始化地图 - 使用卫星图并定位到最近访问的城市
  const initMap = useCallback(async () => {
    // 防止重复初始化
    if (initAttempted.current || !componentMounted.current) {
      return;
    }

    initAttempted.current = true;
    setMapState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 安全验证
      if (!validateMapSecurity()) {
        throw new Error("地图安全验证失败");
      }

      // 检查容器
      if (!checkMapContainer()) {
        throw new Error("地图容器不存在，请确保DOM已准备好");
      }

      // 动态加载高德地图API
      const AMap = await import("@amap/amap-jsapi-loader").then((loader) =>
        loader.default.load({
          key: MAP_CONFIG.apiKey,
          version: MAP_CONFIG.version,
          plugins: MAP_CONFIG.plugins,
        })
      );

      // 获取最近访问的城市作为默认中心点
      const recentCity = getMostRecentVisitedCity(cities);
      const center = recentCity ? recentCity.coordinates : MAP_CONFIG.center;
      console.log("地图中心点:", center);

      // 创建地图实例 - 使用卫星图
      const map = new AMap.Map("map-container", {
        center: center,
        zoom: recentCity ? 10 : MAP_CONFIG.zoom, // 城市级别显示
        mapStyle: "amap://styles/normal", // 使用卫星图
        minZoom: MAP_CONFIG.restrictions.minZoom,
        maxZoom: MAP_CONFIG.restrictions.maxZoom,
        bounds: MAP_CONFIG.restrictions.bounds,
        // 安全配置
        securityJsCode: MAP_CONFIG.securityJsCode,
      });

      // 只添加定位控件
      map.addControl(new AMap.Geolocation());
      // 创建一个卫星图图层
      map.setLayers([new AMap.TileLayer.Satellite()]);

      setMapInstance(map);
      setMapState((prev) => ({
        ...prev,
        isLoaded: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("地图初始化失败:", error);
      setMapState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "地图加载失败",
        isLoaded: false,
      }));

      // 增加重试次数
      setRetryCount((prev) => prev + 1);
      // 重置初始化标志，允许重试
      initAttempted.current = false;
    }
  }, [cities]);

  // 手动启动地图初始化 - 简化为类似demo的模式
  const startMapInit = useCallback(() => {
    if (mapState.isLoading || mapState.isLoaded || !componentMounted.current) {
      return;
    }

    initMap();
  }, [mapState.isLoading, mapState.isLoaded, initMap]);

  // 添加城市标记 - 改进点击处理
  const addCityMarkers = useCallback(
    (cities: City[], onCityClick?: (cityId: string) => void) => {
      if (!mapInstance || !componentMounted.current) return;

      try {
        const markers: CityMarker[] = cities.map((city) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const AMap = (window as any).AMap;

          // 创建标记图标
          const markerIcon =
            MARKER_ICONS[city.status as keyof typeof MARKER_ICONS];
          const icon = new AMap.Icon({
            image: markerIcon.url,
            size: new AMap.Size(markerIcon.size[0], markerIcon.size[1]),
            imageSize: new AMap.Size(markerIcon.size[0], markerIcon.size[1]),
          });

          const marker = new AMap.Marker({
            position: city.coordinates,
            anchor: "bottom-center",
            offset: new AMap.Pixel(0, 0),
            icon: icon,
            title: city.name,
            extData: { cityId: city.id },
            // 添加城市名称标签
            label: {
              content: city.name,
              direction: "bottom",
              offset: new AMap.Pixel(0, 5),
              style: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "bold",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "none",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                whiteSpace: "nowrap",
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
            },
          });

          // 绑定点击事件
          marker.on("click", () => {
            console.log(`点击城市标记: ${city.name} (ID: ${city.id})`);
            if (onCityClick) {
              onCityClick(city.id);
            }
          });

          return {
            data: city,
            marker: marker,
          };
        });

        // 添加所有标记到地图
        markers.forEach((cityMarker) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mapInstance as any).add(cityMarker.marker);
        });

        setMapState((prev) => ({ ...prev, markers }));
      } catch (error) {
        console.error("添加城市标记失败:", error);
      }
    },
    [mapInstance]
  );

  // 清除选中标记
  const clearSelectedMarker = useCallback(() => {
    setMapState((prev) => ({ ...prev, selectedMarker: null }));
  }, []);

  // 地图事件处理
  const handleMapEvent = useCallback(() => {
    // 地图事件处理
  }, []);

  // 重试地图加载
  const retryMapLoad = useCallback(() => {
    setMapState((prev) => ({ ...prev, error: null }));
    initAttempted.current = false;
    setRetryCount(0);
    startMapInit();
  }, [startMapInit]);

  // 设置城市数据
  const setCitiesData = useCallback((citiesData: City[]) => {
    setCities(citiesData);
  }, []);

  return {
    mapState,
    mapInstance,
    retryCount,
    addCityMarkers,
    clearSelectedMarker,
    handleMapEvent,
    retryMapLoad,
    startMapInit, // 导出手动启动函数
    setCitiesData, // 导出设置城市数据的函数
  };
}
