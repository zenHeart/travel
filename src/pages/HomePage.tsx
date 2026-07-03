import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCities } from "../hooks/useCities";
import { SecureMap } from "../components/Map/SecureMap";
import { LoadingSpinner } from "../components/Common/LoadingSpinner";
import { EmptyState } from "../components/Common/EmptyState";

export const HomePage: React.FC = () => {
  const { cities, loading, error, getCitiesByStatus } = useCities();
  const navigate = useNavigate();
  const [showCityList, setShowCityList] = useState(false);

  if (loading) {
    return <LoadingSpinner message="正在加载城市数据..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  const visitedCities = getCitiesByStatus("visited");
  const plannedCities = getCitiesByStatus("planned");
  const wishlistCities = getCitiesByStatus("wishlist");

  const handleCityClick = (cityId: string) => {
    navigate(`/city/${cityId}`);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* 顶部工具栏 - 包含城市列表按钮 */}
      <div className="bg-white shadow-sm p-2 z-30 relative">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            我的旅行地图
          </h1>
          <div className="flex items-center space-x-2">
            {/* 城市列表按钮 - 作为自定义工具 */}
            <button
              onClick={() => setShowCityList(!showCityList)}
              className="btn-secondary btn-mobile text-sm"
              title="城市列表"
            >
              📍 城市列表 ({cities.length})
            </button>
            <button
              onClick={() => navigate("/cards/wuhan-tenglv")}
              className="btn-secondary btn-mobile text-sm"
              title="腾旅卡"
            >
              腾旅卡
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 - 地图占满剩余空间 */}
      <div className="flex-1 relative w-full">
        <SecureMap
          onMapError={(error) => {
            console.error("地图加载错误:", error);
          }}
        />

        {/* 城市列表面板 - 悬浮在顶部 */}
        {showCityList && (
          <div className="absolute top-2 left-2 right-2 md:left-auto md:right-2 md:w-80 z-20">
            <div className="floating-panel max-h-[calc(100vh-120px)] overflow-hidden">
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">城市列表</h2>
                  <button
                    onClick={() => setShowCityList(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* 计划中城市 */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-warning mb-3">
                    计划中城市 ({plannedCities.length})
                  </h3>
                  {plannedCities.length > 0 ? (
                    <div className="space-y-2">
                      {plannedCities.map((city) => (
                        <div
                          key={city.id}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleCityClick(city.id)}
                        >
                          <h4 className="font-medium">{city.name}</h4>
                          <p className="text-sm text-gray-600">计划中</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState type="planned" />
                  )}
                </div>

                {/* 愿望清单城市 */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-primary mb-3">
                    愿望清单城市 ({wishlistCities.length})
                  </h3>
                  {wishlistCities.length > 0 ? (
                    <div className="space-y-2">
                      {wishlistCities.map((city) => (
                        <div
                          key={city.id}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleCityClick(city.id)}
                        >
                          <h4 className="font-medium">{city.name}</h4>
                          <p className="text-sm text-gray-600">愿望清单</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState type="wishlist" />
                  )}
                </div>

                {/* 已访问城市 */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-success mb-3">
                    已访问城市 ({visitedCities.length})
                  </h3>
                  {visitedCities.length > 0 ? (
                    <div className="space-y-2">
                      {visitedCities.map((city) => (
                        <div
                          key={city.id}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleCityClick(city.id)}
                        >
                          <h4 className="font-medium">{city.name}</h4>
                          <p className="text-sm text-gray-600">
                            {city.visitDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState type="visited" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
