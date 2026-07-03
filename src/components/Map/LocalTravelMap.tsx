import React, { useMemo, useState } from "react";
import { City } from "../../types/city";
import { CityCard } from "./CityCard";

interface LocalTravelMapProps {
  cities: City[];
  fallbackReason?: string;
  onRetry?: () => void;
  retryDisabled?: boolean;
}

const statusStyles: Record<
  City["status"],
  { label: string; marker: string; dot: string }
> = {
  visited: {
    label: "已访问",
    marker: "border-emerald-700 bg-emerald-500",
    dot: "bg-emerald-500",
  },
  planned: {
    label: "计划中",
    marker: "border-amber-700 bg-amber-500",
    dot: "bg-amber-500",
  },
  wishlist: {
    label: "愿望清单",
    marker: "border-blue-700 bg-blue-500",
    dot: "bg-blue-500",
  },
};

function getMapBounds(cities: City[]) {
  if (cities.length === 0) {
    return {
      minLng: 73,
      maxLng: 135,
      minLat: 18,
      maxLat: 54,
    };
  }

  const lngs = cities.map((city) => city.coordinates[0]);
  const lats = cities.map((city) => city.coordinates[1]);
  const lngPadding = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.18, 0.8);
  const latPadding = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.18, 0.8);

  return {
    minLng: Math.min(...lngs) - lngPadding,
    maxLng: Math.max(...lngs) + lngPadding,
    minLat: Math.min(...lats) - latPadding,
    maxLat: Math.max(...lats) + latPadding,
  };
}

function projectCity(city: City, bounds: ReturnType<typeof getMapBounds>) {
  const [lng, lat] = city.coordinates;
  const left = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const top = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;

  return {
    left: `${Math.min(Math.max(left, 2), 98)}%`,
    top: `${Math.min(Math.max(top, 2), 98)}%`,
  };
}

export const LocalTravelMap: React.FC<LocalTravelMapProps> = ({
  cities,
  fallbackReason,
  onRetry,
  retryDisabled,
}) => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const bounds = useMemo(() => getMapBounds(cities), [cities]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-x-0 top-1/2 h-28 -translate-y-1/2 rotate-[-8deg] bg-sky-200/30 blur-sm" />
      <div className="absolute inset-6 rounded-lg border border-slate-300 bg-white/55 shadow-inner" />

      <div className="absolute left-3 top-3 z-20 max-w-[calc(100vw-1.5rem)] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm md:max-w-md">
        <div className="text-sm font-semibold text-slate-900">本地静态地图</div>
        <div className="mt-1 text-xs text-slate-500">
          {fallbackReason || "高德地图暂不可用，已使用本地城市点位。"}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retryDisabled}
            className="mt-2 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {retryDisabled ? "重试次数已达上限" : "重试高德地图"}
          </button>
        )}
      </div>

      <div className="absolute inset-8 md:inset-12">
        {cities.map((city) => {
          const position = projectCity(city, bounds);
          const styles = statusStyles[city.status];

          return (
            <button
              key={city.id}
              type="button"
              title={city.name}
              onClick={() => setSelectedCity(city)}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={position}
            >
              <span
                className={`h-5 w-5 rounded-full border-2 shadow-md ${styles.marker}`}
              />
              <span className="max-w-24 rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
                {city.name}
              </span>
            </button>
          );
        })}
      </div>

      {cities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
          暂无城市点位
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-20 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-sm">
        <div className="mb-1 font-medium text-slate-800">城市点位 {cities.length}</div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(statusStyles).map(([status, styles]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
              <span>{styles.label}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedCity && (
        <CityCard city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </div>
  );
};
