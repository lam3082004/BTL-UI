import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/globals.css';
import { SplashPage } from './pages/SplashPage';
import { ChildSelectPage } from './pages/ChildSelectPage';
import { LessonPage } from './pages/LessonPage';
import { RewardPage } from './pages/RewardPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { ProgressReport } from './pages/ProgressReport';
import { ChildConfig } from './pages/ChildConfig';
import { ParentLoginPage } from './pages/ParentLoginPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Child Routes */}
          <Route path="/" element={<SplashPage />} />
          <Route path="/child-select" element={<ChildSelectPage />} />
          <Route path="/lesson" element={<LessonPage />} />
          <Route path="/reward" element={<RewardPage />} />

          {/* Parent Routes */}
          <Route path="/parent-login" element={<ParentLoginPage />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/progress-report/:childId" element={<ProgressReport />} />
          <Route path="/child-config/:childId" element={<ChildConfig />} />

          {/* 404 */}
          <Route path="*" element={<SplashPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
