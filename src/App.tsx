import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import './App.css';

// 详情页与卡片页按路由懒加载：首页只需要地图，
// react-markdown 及其插件链体积大且只在详情页用到
const TripDetailPage = lazy(() =>
  import('./pages/TripDetailPage').then(m => ({ default: m.TripDetailPage }))
);
const PlaceDetailPage = lazy(() =>
  import('./pages/PlaceDetailPage').then(m => ({ default: m.PlaceDetailPage }))
);
const TenglvCardPage = lazy(() =>
  import('./pages/TenglvCardPage').then(m => ({ default: m.TenglvCardPage }))
);

const legacyTrips: Record<string, string> = {
  chongqing: '2022-10-02-chongqing', hangzhou: '2019-xian-nanjing-hangzhou',
  hongkong: '2026-09-25-zhuhai-hongkong-guangzhou', huangshi: '2025-08-16-huangshi',
  nanjing: '2019-xian-nanjing-hangzhou', qinghai: '2019-05-17-qinghai',
  rizhao: '2025-09-27-rizhao-qingdao', shanghai: '2025-08-01-shanghai',
  shenzhen: '2017-05-28-shenzhen-nanao', xian: '2019-xian-nanjing-hangzhou',
  yichang: '2023-04-29-yichang', aershan: 'undated-aershan',
  daocheng: 'undated-daocheng',
};

function LegacyCityRedirect() {
  const { id = '', file } = useParams();
  if (id === 'wuhan') return <Navigate replace to="/place/wuhan/index" />;
  if (id === 'hongkong' && file === 'shopping') {
    return <Navigate replace to="/2016-hongkong-shopping/index" />;
  }
  const tripId = legacyTrips[id];
  const page = file || (['xian', 'nanjing', 'hangzhou', 'rizhao'].includes(id) ? id : 'index');
  return <Navigate replace to={tripId ? `/${tripId}/${page}` : '/'} />;
}

function LegacyZhuhaiTripRedirect() {
  const params = useParams();
  const raw = params['*'] || params.page || 'index';
  const page = raw === 'shenzhen' ? 'zhuhai' : raw === 'chimelong' ? 'zhuhai/chimelong' : raw;
  return <Navigate replace to={`/2026-09-25-zhuhai-hongkong-guangzhou/${page}`} />;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App h-screen w-screen overflow-hidden">
          <Suspense fallback={<LoadingSpinner message="加载中..." />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards/wuhan-tenglv" element={<Navigate replace to="/place/wuhan/tenglv" />} />
              <Route path="/place/:placeId/index" element={<PlaceDetailPage />} />
              <Route path="/place/wuhan/tenglv" element={<TenglvCardPage />} />
              <Route path="/undated-yichang/:page" element={<Navigate replace to="/2023-04-29-yichang/index" />} />
              <Route path="/undated-chongqing/:page" element={<Navigate replace to="/2022-10-02-chongqing/index" />} />
              <Route path="/undated-hongkong-shopping-2025/:page" element={<Navigate replace to="/2016-hongkong-shopping/index" />} />
              <Route path="/undated-xian-nanjing-hangzhou/:page" element={<Navigate replace to="/2019-xian-nanjing-hangzhou/index" />} />
              <Route path="/undated-wuhan/:page" element={<Navigate replace to="/place/wuhan/index" />} />
              <Route path="/2026-09-24-zhuhai-shenzhen-hongkong/*" element={<LegacyZhuhaiTripRedirect />} />
              <Route path="/2026-09-24-zhuhai-shenzhen-hongkong" element={<Navigate replace to="/2026-09-25-zhuhai-hongkong-guangzhou/index" />} />
              <Route path="/2026-09-25-zhuhai-shenzhen-hongkong/*" element={<LegacyZhuhaiTripRedirect />} />
              <Route path="/2026-09-25-zhuhai-shenzhen-hongkong" element={<Navigate replace to="/2026-09-25-zhuhai-hongkong-guangzhou/index" />} />
              <Route path="/city/:id" element={<LegacyCityRedirect />} />
              <Route path="/city/:id/:file" element={<LegacyCityRedirect />} />
              <Route path="/:tripId/*" element={<TripDetailPage />} />
              <Route path="/:tripId" element={<TripDetailPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
