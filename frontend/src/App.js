import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Inventory    from './pages/Inventory';
import ItemDetail   from './pages/ItemDetail';
import Locations    from './pages/Locations';
import Suppliers    from './pages/Suppliers';
import Transactions from './pages/Transactions';
import PurchaseOrders from './pages/PurchaseOrders';
import AuditLog     from './pages/AuditLog';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/"                 element={<Dashboard />} />
                <Route path="/inventory"        element={<Inventory />} />
                <Route path="/inventory/:id"    element={<ItemDetail />} />
                <Route path="/locations"        element={<Locations />} />
                <Route path="/suppliers"        element={<Suppliers />} />
                <Route path="/transactions"     element={<Transactions />} />
                <Route path="/purchase-orders"  element={<PurchaseOrders />} />
                <Route path="/audit"            element={<AuditLog />} />
                <Route path="*"                 element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
