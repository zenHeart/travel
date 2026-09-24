import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TripMapPoint } from '../../types/trip';

export function LocalTravelMap({ points, fallbackReason }: { points: TripMapPoint[]; fallbackReason?: string }) {
  const navigate = useNavigate();
  const bounds = useMemo(() => {
    const lngs = points.map(point => point.coordinates[0]);
    const lats = points.map(point => point.coordinates[1]);
    return {
      minLng: Math.min(73, ...lngs), maxLng: Math.max(135, ...lngs),
      minLat: Math.min(18, ...lats), maxLat: Math.max(54, ...lats),
    };
  }, [points]);
  const colors = { visited: 'bg-emerald-500', planned: 'bg-blue-500', wishlist: 'bg-blue-500' };
  return <div className="relative h-full w-full overflow-hidden bg-slate-100">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:48px_48px]" />
    <div className="absolute left-3 top-3 z-20 rounded-lg bg-white/95 px-3 py-2 text-sm shadow-sm">本地点位图 · {fallbackReason}</div>
    <div className="absolute right-3 top-3 z-20 hidden max-h-[65vh] w-52 overflow-y-auto rounded-lg bg-white/95 p-3 text-sm shadow-sm md:block">
      <div className="mb-2 font-semibold">计划与心愿城市</div>
      {points.filter(point => point.status !== 'visited').map(point => <button key={point.id} className="block w-full rounded px-2 py-1 text-left hover:bg-slate-100" onClick={() => navigate(point.path)}>{point.label} <span className="text-xs text-slate-500">· {point.status === 'planned' ? '计划' : '心愿'} · {point.tripTitle}</span></button>)}
    </div>
    <div className="absolute inset-8 md:inset-12">{points.map((point, index) => {
      const [lng, lat] = point.coordinates;
      const samePlace = points.slice(0, index).filter(other => other.coordinates[0] === lng && other.coordinates[1] === lat).length;
      return <button key={point.id} type="button" title={`${point.label} · ${point.tripTitle}`} onClick={() => navigate(point.path)}
        className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
        style={{ left: `${((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100}%`, top: `calc(${((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100}% + ${samePlace * 32}px)` }}>
        <span className={`h-5 w-5 rounded-full border-2 border-white shadow-md ${colors[point.status]}`} />
        <span className="rounded bg-white/95 px-1.5 py-0.5 text-xs font-medium shadow-sm">{point.label}</span>
      </button>;
    })}</div>
    <div className="absolute bottom-3 left-3 z-20 rounded bg-white/95 px-3 py-2 text-xs">城市点位 {points.length}</div>
  </div>;
}
