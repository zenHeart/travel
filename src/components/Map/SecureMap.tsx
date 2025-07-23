import React, { useState, useEffect, useRef } from 'react';
import { useMap } from '../../hooks/useMap';
import { useCities } from '../../hooks/useCities';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { CityCard } from './CityCard';

interface SecureMapProps {
  onMapError?: (error: string) => void;
}

export const SecureMap: React.FC<SecureMapProps> = ({ 
  onMapError 
}) => {
  const { cities, loading: citiesLoading } = useCities();
  const { 
    mapState, 
    addCityMarkers, 
    clearSelectedMarker, 
    retryMapLoad,
    retryCount,
    startMapInit,
    setCitiesData
  } = useMap();
  
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initStarted = useRef(false);

  // 处理地图错误
  useEffect(() => {
    if (mapState.error) {
      console.error('地图错误:', mapState.error);
      setError(mapState.error);
      onMapError?.(mapState.error);
    }
  }, [mapState.error, onMapError]);

  // 当城市数据加载完成时，传递给地图hook并添加标记
  useEffect(() => {
    // 传递城市数据给地图hook用于默认定位
    setCitiesData(cities);
    
    if (mapState.isLoaded && cities.length > 0) {
      addCityMarkers(cities);
    }
  }, [mapState.isLoaded, cities, addCityMarkers, setCitiesData]);

  // 当城市数据可用时，触发地图初始化
  useEffect(() => {
    if (cities.length > 0 && !mapState.isLoaded && !mapState.isLoading && !initStarted.current) {
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
    if (!initStarted.current && 
        !mapState.isLoading && 
        !mapState.isLoaded &&
        mapContainerRef.current &&
        cities.length === 0) { // 如果没有城市数据，使用备用初始化
      
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
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-red-500 text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">地图加载失败</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {error}
        </p>
        <div className="space-x-4">
          <button 
            onClick={handleRetry}
            className="btn-primary btn-mobile"
            disabled={retryCount >= 3}
          >
            {retryCount >= 3 ? '重试次数已达上限' : '重试加载'}
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary btn-mobile"
          >
            刷新页面
          </button>
        </div>
        {retryCount > 0 && (
          <p className="text-sm text-gray-500 mt-4">
            已重试 {retryCount} 次
          </p>
        )}
      </div>
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