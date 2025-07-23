import { useState, useEffect } from 'react';
import { City } from '../types/city';
import { ContentScanner } from '../utils/contentScanner';

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        const scanner = new ContentScanner();
        const citiesData = await scanner.scanContent();
        setCities(citiesData);
        setError(null);
      } catch (err) {
        console.error('加载城市数据失败:', err);
        setError('加载城市数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  const getCitiesByStatus = (status: 'visited' | 'planned' | 'wishlist') => {
    return cities.filter(city => city.status === status);
  };

  const getCityById = (id: string) => {
    return cities.find(city => city.id === id);
  };

  return {
    cities,
    loading,
    error,
    getCitiesByStatus,
    getCityById,
  };
} 