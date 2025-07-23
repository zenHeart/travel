import React, { useEffect, useRef } from 'react';
import { useCities } from '../../hooks/useCities';
import { useMap } from '../../hooks/useMap';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { CityCard } from './CityCard';

export const TravelMap: React.FC = () => {
  const { cities, loading: citiesLoading } = useCities();
  const { 
    mapState, 
    addCityMarkers, 
    clearSelectedMarker, 
    retryMapLoad,
    retryCount 
  } = useMap();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 当城市数据加载完成时，添加标记
  useEffect(() => {
    if (mapState.isLoaded && cities.length > 0) {
      addCityMarkers(cities);
    }
  }, [mapState.isLoaded, cities, addCityMarkers]);



  // 处理地图点击
  const handleMapClick = () => {
    clearSelectedMarker();
  };

  // 渲染错误状态
  if (mapState.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-red-500 text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">地图加载失败</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {mapState.error}
        </p>
        <div className="space-x-4">
          <button 
            onClick={retryMapLoad}
            className="btn-primary"
            disabled={retryCount >= 3}
          >
            {retryCount >= 3 ? '重试次数已达上限' : '重试加载'}
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary"
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

  // 渲染加载状态
  if (citiesLoading || mapState.isLoading) {
    return <LoadingSpinner message="正在加载地图..." />;
  }

  return (
    <div className="relative w-full h-full">
      {/* 地图容器 */}
      <div 
        ref={mapContainerRef}
        id="map-container"
        className="w-full h-full"
        style={{ minHeight: '600px' }}
        onClick={handleMapClick}
      />
      
      {/* 城市卡片 */}
      {mapState.selectedMarker && (
        <div className="absolute top-4 right-4 z-10">
          <CityCard 
            city={mapState.selectedMarker.data}
            onClose={clearSelectedMarker}
          />
        </div>
      )}
      
      {/* 地图状态指示器 */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>已加载 {cities.length} 个城市</span>
        </div>
      </div>
    </div>
  );
}; 