import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/globals.css';
import { SplashPage } from './pages/SplashPage';
import { ChildSelectPage } from './pages/ChildSelectPage';
import { ChildHomePage } from './pages/ChildHomePage';
import { LessonPage } from './pages/LessonPage';
import { LessonSelectPage } from './pages/LessonSelectPage';
import { TreasurePage } from './pages/TreasurePage';
import { RewardPage } from './pages/RewardPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { ParentSettings } from './pages/ParentSettings';
import { ProgressReport } from './pages/ProgressReport';
import { ChildConfig } from './pages/ChildConfig';
import { ParentLoginPage } from './pages/ParentLoginPage';
import { PwaStatusBanner } from './components/PwaStatusBanner';
import { ChallengeSelectPage } from './pages/ChallengeSelectPage';
import { MonsterChallengePage } from './pages/MonsterChallengePage';
import { BalanceScalePage } from './pages/BalanceScalePage';
import { SubitizingPage } from './pages/SubitizingPage';
import { SubtractionPage } from './pages/SubtractionPage';
import { MultiplicationGroupsPage } from './pages/MultiplicationGroupsPage';
import { DivisionPage } from './pages/DivisionPage';
import { FractionsPage } from './pages/FractionsPage';
import { ClockPage } from './pages/ClockPage';
import { MeasurementPage } from './pages/MeasurementPage';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PwaStatusBanner />
          <Routes>
            {/* Child Routes */}
            <Route path="/" element={<SplashPage />} />
          <Route path="/child-select" element={<ChildSelectPage />} />
          <Route path="/child/:childId/home" element={<ChildHomePage />} />
          <Route path="/child/:childId/lessons" element={<LessonSelectPage />} />
          <Route path="/child/:childId/lesson" element={<LessonPage />} />
          <Route path="/child/:childId/treasure" element={<TreasurePage />} />
          <Route path="/child/:childId/challenges" element={<ChallengeSelectPage />} />
          <Route path="/child/:childId/monster-challenge" element={<MonsterChallengePage />} />
          <Route path="/child/:childId/balance-scale" element={<BalanceScalePage />} />
          <Route path="/child/:childId/subitizing" element={<SubitizingPage />} />
          <Route path="/child/:childId/subtraction" element={<SubtractionPage />} />
          <Route path="/child/:childId/multiplication" element={<MultiplicationGroupsPage />} />
          <Route path="/child/:childId/division" element={<DivisionPage />} />
          <Route path="/child/:childId/fractions" element={<FractionsPage />} />
          <Route path="/child/:childId/clock" element={<ClockPage />} />
          <Route path="/child/:childId/measurement" element={<MeasurementPage />} />
          <Route path="/lesson" element={<LessonPage />} />
          <Route path="/reward" element={<RewardPage />} />

          {/* Parent Routes */}
          <Route path="/parent-login" element={<ParentLoginPage />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/parent-settings" element={<ParentSettings />} />
          <Route path="/progress-report/:childId" element={<ProgressReport />} />
          <Route path="/child-config/:childId" element={<ChildConfig />} />

          {/* 404 */}
          <Route path="*" element={<SplashPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
   </ErrorBoundary>
  );
}

export default App;
