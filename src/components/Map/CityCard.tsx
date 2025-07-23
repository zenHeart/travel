import React from 'react';
import { useNavigate } from 'react-router-dom';
import { City } from '../../types/city';

interface CityCardProps {
  city: City;
  onClose?: () => void;
}

export const CityCard: React.FC<CityCardProps> = ({ city, onClose }) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    navigate(`/city/${city.id}`);
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{city.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center">
          <span className={`text-sm font-medium ${getStatusColor(city.status)}`}>
            {getStatusText(city.status)}
          </span>
        </div>
        
        {city.visitDate && (
          <p className="text-sm text-gray-600">
            访问时间: {city.visitDate}
          </p>
        )}
        
        {city.duration && (
          <p className="text-sm text-gray-600">
            行程: {city.duration}
          </p>
        )}
        
        <p className="text-sm text-gray-600 line-clamp-2">
          {city.summary}
        </p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleClick}
          className="btn-primary flex-1"
        >
          查看详情
        </button>
      </div>
    </div>
  );
}; 