import { AppProvider, useApp } from './context/AppContext';
import { useNotifications } from './hooks/useNotifications';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { OnboardingModal } from './components/OnboardingModal';
import { HomePage } from './pages/HomePage';
import { MovementsPage } from './pages/MovementsPage';
import { CardsPage } from './pages/CardsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { GoalsPage } from './pages/GoalsPage';

function AppContent() {
  const { currentPage, isLoggedIn, state } = useApp();
  useNotifications();

  if (!isLoggedIn) return <LoginPage />;

  const pages = {
    home: <HomePage />,
    movements: <MovementsPage />,
    cards: <CardsPage />,
    expenses: <ExpensesPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage />,
    profile: <ProfilePage />,
    goals: <GoalsPage />,
  };

  return (
    <Layout>
      {pages[currentPage] ?? <HomePage />}
      {!state.profile.onboardingDone && <OnboardingModal />}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
