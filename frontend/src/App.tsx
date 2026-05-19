import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/molecules/ProtectedRoute/ProtectedRoute';
import AppShell from './components/organisms/AppShell/AppShell';
import LoginPage from './pages/LoginPage/LoginPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import SamplesPage from './pages/SamplesPage/SamplesPage';
import SampleDetailPage from './pages/SampleDetailPage/SampleDetailPage';
import ContainersPage from './pages/ContainersPage/ContainersPage';
import InventoryPage from './pages/InventoryPage/InventoryPage';
import InventoryDetailPage from './pages/InventoryDetailPage/InventoryDetailPage';
import ExperimentsPage from './pages/ExperimentsPage/ExperimentsPage';
import ExperimentDetailPage from './pages/ExperimentDetailPage/ExperimentDetailPage';
import ReportsPage from './pages/ReportsPage/ReportsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/samples" element={<SamplesPage />} />
              <Route path="/samples/:id" element={<SampleDetailPage />} />
              <Route path="/containers" element={<ContainersPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/:id" element={<InventoryDetailPage />} />
              <Route path="/experiments" element={<ExperimentsPage />} />
              <Route path="/experiments/:id" element={<ExperimentDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
