import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../hooks/useTrips';
import { MAP_CONFIG, MARKER_ICONS } from '../../constants/map';
import { LocalTravelMap } from './LocalTravelMap';
import { places } from '../../utils/placeScanner';

export function SecureMap() {
  const { trips } = useTrips();
  const points = useMemo(() => [
    ...trips.flatMap(trip => trip.points),
    ...places.map(place => ({
      id: `place/${place.id}`, label: place.name, coordinates: place.coordinates,
      status: 'visited' as const, path: `/place/${place.id}/index`,
      tripId: `place/${place.id}`, tripTitle: '常驻地',
    })),
  ], [trips]);
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ destroy: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!container.current) return;
    if (!import.meta.env.VITE_AMAP_API_KEY) {
      setError('本地未配置高德地图密钥，已使用本地点位图。');
      setLoading(false);
      return;
    }
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      cancelled = true;
      setError('在线地图加载超时，已使用本地点位图。');
      setLoading(false);
    }, 5000);
    async function createMap() {
      try {
        const loader = await import('@amap/amap-jsapi-loader');
        const AMap = await loader.default.load({ key: MAP_CONFIG.apiKey, version: MAP_CONFIG.version });
        if (cancelled || !container.current) return;
        window.clearTimeout(timeout);
        const map = new AMap.Map(container.current, { center: MAP_CONFIG.center, zoom: MAP_CONFIG.zoom });
        mapRef.current = map;
        points.forEach(point => {
          const icon = MARKER_ICONS[point.status === 'visited' ? 'visited' : 'wishlist'];
          const marker = new AMap.Marker({
            position: point.coordinates,
            title: `${point.label} · ${point.tripTitle}`,
            icon: new AMap.Icon({ image: icon.url, size: new AMap.Size(...icon.size), imageSize: new AMap.Size(...icon.size) }),
            label: { content: point.label, direction: 'bottom' },
          });
          marker.on('click', () => navigate(point.path));
          map.add(marker);
        });
        setLoading(false);
      } catch (cause) {
        if (!cancelled) {
          window.clearTimeout(timeout);
          setError(cause instanceof Error ? cause.message : '地图加载失败');
          setLoading(false);
        }
      }
    }
    createMap();
    return () => { cancelled = true; window.clearTimeout(timeout); mapRef.current?.destroy(); mapRef.current = null; };
  }, [points, navigate]);

  return <div className="relative h-full w-full">
    <div ref={container} id="map-container" className={`map-container h-full w-full ${loading || error ? 'opacity-0' : ''}`} />
    {(loading || error) && <div className="absolute inset-0"><LocalTravelMap points={points} fallbackReason={error || '在线地图加载中；可直接选择城市点位。'} /></div>}
  </div>;
}
