import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import './App.css';

// 详情页与卡片页按路由懒加载：首页只需要地图，
// react-markdown 及其插件链体积大且只在详情页用到
const CityDetailPage = lazy(() =>
  import('./pages/CityDetailPage').then(m => ({ default: m.CityDetailPage }))
);
const TenglvCardPage = lazy(() =>
  import('./pages/TenglvCardPage').then(m => ({ default: m.TenglvCardPage }))
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App h-screen w-screen overflow-hidden">
          <Suspense fallback={<LoadingSpinner message="加载中..." />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/city/:id" element={<CityDetailPage />} />
              <Route path="/city/:id/:file" element={<CityDetailPage />} />
              <Route path="/cards/wuhan-tenglv" element={<TenglvCardPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
