import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCities } from '../hooks/useCities';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { MarkdownContent } from '../components/Markdown/MarkdownContent';

export const CityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCityById, loading } = useCities();

  if (loading) {
    return <LoadingSpinner message="正在加载城市信息..." />;
  }

  const city = id ? getCityById(id) : null;

  if (!city) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">城市不存在</h3>
        <p className="text-gray-500 mb-4">未找到城市信息</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          返回首页
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'visited':
        return 'text-success';
      case 'planned':
        return 'text-warning';
      case 'wishlist':
        return 'text-primary';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'visited':
        return '已访问';
      case 'planned':
        return '计划中';
      case 'wishlist':
        return '愿望清单';
      default:
        return status;
    }
  };

  // 合并所有Markdown文件
  const allFiles = [city.files.index, ...city.files.related];
  
  // 构建basePath
  const basePath = `${city.status}/${city.id}`;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary btn-mobile"
            >
              ← 返回首页
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{city.name}</h1>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(city.status)}`}>
              {getStatusText(city.status)}
            </span>
          </div>
        </div>
      </div>

      {/* 主要内容 - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto detail-scroll">
        <div className="max-w-4xl mx-auto p-4 md:p-6 detail-mobile">
          {/* Markdown内容 - 移除外部容器间距，确保移动端宽度占满 */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">详细攻略</h2>
            <MarkdownContent files={allFiles} basePath={basePath} />
          </div>

          {/* 内部链接 */}
          {city.links.internal.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">相关链接</h2>
              <div className="space-y-2">
                {city.links.internal.map(link => (
                  <div 
                    key={link.target}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-blue-600 hover:text-blue-800">
                      {link.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 