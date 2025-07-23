import React from 'react';

interface EmptyStateProps {
  type: 'visited' | 'planned' | 'wishlist';
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, message }) => {
  const getDefaultMessage = () => {
    switch (type) {
      case 'visited':
        return '还没有访问过的城市';
      case 'planned':
        return '还没有计划中的城市';
      case 'wishlist':
        return '还没有愿望清单中的城市';
      default:
        return '暂无数据';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'visited':
        return '✅';
      case 'planned':
        return '⏰';
      case 'wishlist':
        return '❤️';
      default:
        return '📝';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-4xl mb-4">{getIcon()}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message || getDefaultMessage()}
      </h3>
      <p className="text-gray-500">
        添加更多城市到你的旅行计划中吧！
      </p>
    </div>
  );
}; 