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

  const [mapInstance, setMapInstance] = useState<AMap.Map | null>(null);
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
    (cities: City[]) => {
      if (!mapInstance || !componentMounted.current) return;

      try {
        const markers: CityMarker[] = cities.map((city) => ({
          id: city.id,
          position: city.coordinates,
          status: city.status,
          name: city.name,
          data: city,
        }));

        // 清除现有标记
        mapInstance.clearMap();

        // 添加新标记
        markers.forEach((markerData) => {
          const icon =
            MARKER_ICONS[markerData.status as keyof typeof MARKER_ICONS];
          const marker = new (
            window as typeof window & { AMap: typeof AMap }
          ).AMap.Marker({
            position: markerData.position,
            icon: new (
              window as typeof window & { AMap: typeof AMap }
            ).AMap.Icon({
              imageUrl: icon.url,
              size: new (
                window as typeof window & { AMap: typeof AMap }
              ).AMap.Size(icon.size[0], icon.size[1]),
              imageOffset: new (
                window as typeof window & { AMap: typeof AMap }
              ).AMap.Pixel(0, 0),
              imageSize: new (
                window as typeof window & { AMap: typeof AMap }
              ).AMap.Size(icon.size[0], icon.size[1]),
            }),
            title: markerData.name,
            // 添加标记信息窗口
            label: {
              content: markerData.name,
              direction: "top",
              offset: [0, -10],
            },
          });

          // 添加点击事件 - 改进点击处理，直接跳转到详情页
          marker.on("click", () => {
            // 设置选中标记
            setMapState((prev) => ({ ...prev, selectedMarker: markerData }));

            // 平滑移动到标记位置
            mapInstance.setCenter(markerData.position);
            mapInstance.setZoom(14);

            // 立即跳转到详情页
            window.location.href = `/city/${markerData.id}`;
          });

          mapInstance.add(marker);
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
