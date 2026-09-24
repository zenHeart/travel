import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';
import { SecureMap } from '../components/Map/SecureMap';

export function HomePage() {
  const { trips } = useTrips();
  const wished = trips.filter(trip => trip.status === 'wishlist');
  const timeline = trips.filter(trip => trip.status !== 'wishlist');
  const years = [...new Set(timeline.map(trip => trip.startDate?.slice(0, 4) || trip.startYear || '日期未定'))];
  const navigate = useNavigate();
  const [showTrips, setShowTrips] = useState(false);
  const [showWishes, setShowWishes] = useState(false);
  return <div className="flex h-screen w-full flex-col overflow-hidden">
    <div className="relative z-30 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">我的旅行地图</h1>
        <div className="flex items-center space-x-2">
          <button className="btn-secondary btn-mobile text-sm" onClick={() => setShowTrips(!showTrips)}>📍 游记列表 ({trips.length})</button>
          <button className="btn-secondary btn-mobile text-sm" onClick={() => navigate('/place/wuhan/index')}>武汉 · 常驻地</button>
        </div>
      </div>
    </div>
    <div className="relative w-full flex-1">
      <SecureMap />
      {showTrips && <div className="absolute left-2 right-2 top-2 z-20 md:left-auto md:w-80">
        <div className="floating-panel max-h-[calc(100vh-120px)] overflow-y-auto p-4">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">游记列表</h2><button onClick={() => setShowTrips(false)}>✕</button></div>
          <section className="mb-6">
            <button className="mb-2 flex w-full items-center justify-between text-left font-medium text-blue-700" aria-expanded={showWishes} onClick={() => setShowWishes(!showWishes)}>
              <span>♡ 心愿 ({wished.length})</span><span aria-hidden="true">{showWishes ? '▾' : '▸'}</span>
            </button>
            {showWishes && <div className="space-y-2 border-l-2 border-blue-200 pl-3">{wished.map(trip => <button key={trip.id} className="w-full rounded-lg bg-blue-50 p-3 text-left hover:bg-blue-100" onClick={() => navigate(`/${trip.id}/index`)}>
              <span className="block font-medium">{trip.title}</span>
              <span className="text-sm text-gray-500">{trip.dateHint || trip.startDate || trip.startYear || '日期未定'} · {trip.points.map(point => point.label).join('、')}</span>
            </button>)}</div>}
          </section>
          <section>
            <h3 className="mb-2 font-medium">行程时间轴 ({timeline.length})</h3>
            {years.map(year => <div key={year} className="mb-4 border-l-2 border-slate-200 pl-3">
              <div className="mb-2 text-sm font-semibold text-slate-700">{year}</div>
              <div className="space-y-2">{timeline.filter(trip => (trip.startDate?.slice(0, 4) || trip.startYear || '日期未定') === year).map(trip => <button key={trip.id} className={`w-full rounded-lg p-3 text-left ${trip.status === 'planned' ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => navigate(`/${trip.id}/index`)}>
                <span className="block font-medium">{trip.status === 'planned' && <span className="mr-2 text-xs text-blue-700">计划</span>}{trip.title}</span>
                <span className="text-sm text-gray-500">{trip.dateHint || trip.startDate || trip.startYear || '日期未定'} · {trip.points.map(point => point.label).join('、')}</span>
              </button>)}</div>
            </div>)}
          </section>
        </div>
      </div>}
    </div>
  </div>;
}
