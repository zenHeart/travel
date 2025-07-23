import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { CityDetailPage } from './pages/CityDetailPage';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App h-screen w-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/city/:id" element={<CityDetailPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
