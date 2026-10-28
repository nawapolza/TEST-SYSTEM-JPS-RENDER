import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import Layout from './components/Layout.jsx';
import Loading from './components/Loading.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { BranchProvider, useBranch } from './contexts/BranchContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminRecoveryPage from './pages/AdminRecoveryPage.jsx';

const BranchesPage = lazy(() => import('./pages/BranchesPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const FuelCalculatorPage = lazy(() => import('./pages/FuelCalculatorPage.jsx'));
const DeliveriesPage = lazy(() => import('./pages/DeliveriesPage.jsx'));
const EmployeeQuickPage = lazy(() => import('./pages/EmployeeQuickPage.jsx'));
const AccountPage = lazy(() => import('./pages/AccountPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.jsx'));
const MonthlyReportsPage = lazy(() => import('./pages/MonthlyReportsPage.jsx'));
const UsersPage = lazy(() => import('./pages/UsersPage.jsx'));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage.jsx'));
const TransportLedgerPage = lazy(() => import('./pages/TransportLedgerPage.jsx'));
const TripFinancePage = lazy(() => import('./pages/TripFinancePage.jsx'));
const MaterialsPage = lazy(() => import('./pages/MaterialsPage.jsx'));
const BillingPage = lazy(() => import('./pages/BillingPage.jsx'));


export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  if (window.location.pathname.replace(/\/+$/, '') === '/adminnakub') return <AdminRecoveryPage />;
  if (loading) return <Loading />;
  if (!user) return <LoginPage />;
  return (
    <BranchProvider>
      <AppShell />
    </BranchProvider>
  );
}

function AppShell() {
  const { user, isOwner } = useAuth();
  const { activeBranchId, loading: branchLoading, revision } = useBranch();
  const [page, setPage] = useState('quick');

  useEffect(() => {
    if (!user) return;
    setPage(isOwner ? 'dashboard' : 'quick');
  }, [isOwner, user?.id]);

  const pageKey = `${activeBranchId || 'branch'}-${revision}`;
  const pages = useMemo(() => {
    if (!isOwner) {
      return {
        account: <AccountPage key={`account-${pageKey}`} />,
        quick: <EmployeeQuickPage key={`quick-${pageKey}`} />,
        calculator: <FuelCalculatorPage key={`calculator-${pageKey}`} />,
        deliveries: <DeliveriesPage key={`deliveries-${pageKey}`} />,
      };
    }
    return {
      account: <AccountPage key={`account-${pageKey}`} />,
      dashboard: <DashboardPage key={`dashboard-${pageKey}`} setPage={setPage} />,
      branches: <BranchesPage key={`branches-${pageKey}`} />,
      calculator: <FuelCalculatorPage key={`calculator-${pageKey}`} />,
      quick: <EmployeeQuickPage key={`quick-${pageKey}`} />,
      deliveries: <DeliveriesPage key={`deliveries-${pageKey}`} />,
      reports: <MonthlyReportsPage key={`reports-${pageKey}`} />,
      trips: <TripFinancePage key={`trips-${pageKey}`} />,
      billing: <BillingPage key={`billing-${pageKey}`} />,
      ledger: <TransportLedgerPage key={`ledger-${pageKey}`} />,
      users: <UsersPage key={`users-${pageKey}`} />,
      materials: <MaterialsPage key={`materials-${pageKey}`} />,
      vehicles: <VehiclesPage key={`vehicles-${pageKey}`} />,
      notifications: <NotificationsPage key={`notifications-${pageKey}`} />,
    };
  }, [activeBranchId, isOwner, pageKey]);

  if (branchLoading || !activeBranchId) return <Loading />;

  const safePage = pages[page] ? page : (isOwner ? 'dashboard' : 'quick');
  return (
    <Layout page={safePage} setPage={setPage}>
      <Suspense fallback={<Loading text="กำลังเปิดหน้าระบบ..." />}>
        {pages[safePage]}
      </Suspense>
    </Layout>
  );
}
