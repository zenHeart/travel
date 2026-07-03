import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMap } from "../../hooks/useMap";
import { useCities } from "../../hooks/useCities";
import { LoadingSpinner } from "../Common/LoadingSpinner";
import { CityCard } from "./CityCard";
import { LocalTravelMap } from "./LocalTravelMap";

interface SecureMapProps {
  onMapError?: (error: string) => void;
}

export const SecureMap: React.FC<SecureMapProps> = ({ onMapError }) => {
  const navigate = useNavigate();
  const { cities, loading: citiesLoading } = useCities();
  const {
    mapState,
    addCityMarkers,
    clearSelectedMarker,
    retryMapLoad,
    retryCount,
    startMapInit,
    setCitiesData,
  } = useMap();

  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initStarted = useRef(false);

  // 处理地图错误
  useEffect(() => {
    if (mapState.error) {
      console.error("地图错误:", mapState.error);
      setError(mapState.error);
      onMapError?.(mapState.error);
    }
  }, [mapState.error, onMapError]);

  // 城市点击处理函数
  const handleCityClick = (cityId: string) => {
    console.log(`导航到城市: ${cityId}`);
    navigate(`/city/${cityId}`);
  };

  // 当城市数据加载完成时，传递给地图hook并添加标记
  useEffect(() => {
    // 传递城市数据给地图hook用于默认定位
    setCitiesData(cities);

    if (mapState.isLoaded && cities.length > 0) {
      addCityMarkers(cities, handleCityClick);
    }
  }, [mapState.isLoaded, cities, addCityMarkers, setCitiesData, navigate]);

  // 当城市数据可用时，触发地图初始化
  useEffect(() => {
    if (
      cities.length > 0 &&
      !mapState.isLoaded &&
      !mapState.isLoading &&
      !initStarted.current
    ) {
      initStarted.current = true;
      requestAnimationFrame(() => {
        startMapInit();
      });
    }
  }, [cities.length, mapState.isLoaded, mapState.isLoading, startMapInit]);

  // 简化的地图初始化逻辑 - 确保容器存在后再初始化（作为备用）
  useEffect(() => {
    // 只有在未开始初始化、地图未加载且未加载中时才启动
    // 优先等待城市数据加载完成
    if (
      !initStarted.current &&
      !mapState.isLoading &&
      !mapState.isLoaded &&
      mapContainerRef.current &&
      cities.length === 0
    ) {
      // 如果没有城市数据，使用备用初始化

      initStarted.current = true;

      // 使用 requestAnimationFrame 确保DOM完全准备好
      requestAnimationFrame(() => {
        startMapInit();
      });
    }
  }, [startMapInit, mapState.isLoading, mapState.isLoaded, cities.length]);

  // 处理地图点击
  const handleMapClick = () => {
    clearSelectedMarker();
  };

  // 重试地图加载
  const handleRetry = () => {
    setError(null);
    initStarted.current = false; // 重置初始化标志
    retryMapLoad();
  };

  // 渲染错误状态
  if (error) {
    return (
      <LocalTravelMap
        cities={cities}
        fallbackReason={
          error === "地图安全验证失败"
            ? "本地未配置高德地图密钥，已使用本地城市点位。"
            : error
        }
        onRetry={handleRetry}
        retryDisabled={retryCount >= 3}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* 地图容器 - 占满整个容器 */}
      <div
        ref={mapContainerRef}
        id="map-container"
        className="map-container"
        onClick={handleMapClick}
      />

      {/* 加载状态覆盖层 */}
      {(citiesLoading || mapState.isLoading) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
          <LoadingSpinner message="正在加载地图..." />
        </div>
      )}

      {/* 城市卡片 - 悬浮在地图上 */}
      {mapState.selectedMarker && (
        <div className="absolute top-4 right-4 z-30 md:max-w-sm w-full max-w-[calc(100vw-2rem)]">
          <CityCard
            city={mapState.selectedMarker.data}
            onClose={clearSelectedMarker}
          />
        </div>
      )}
    </div>
  );
};
