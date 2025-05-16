
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminOrders from "./pages/admin/Orders";
import AdminClients from "./pages/admin/Clients";
import AdminSellers from "./pages/admin/Sellers";
import AdminInventory from "./pages/admin/Inventory";
import AdminSettings from "./pages/admin/Settings";

// Seller Pages
import SellerDashboard from "./pages/vendedor/Dashboard";
import SellerOrders from "./pages/vendedor/Orders";
import SellerClients from "./pages/vendedor/Clients";
import SellerInventory from "./pages/vendedor/Inventory";
import SellerSettings from "./pages/vendedor/Settings";

// Client Pages
import ClientDashboard from "./pages/clientes/Dashboard";
import ClientOrders from "./pages/clientes/Orders";
import ClientVehicles from "./pages/clientes/Vehicles";

// Create a query client
const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/services" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminServices />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminClients />
              </ProtectedRoute>
            } />
            <Route path="/admin/sellers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSellers />
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminInventory />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute allowedRoles={['admin', 'seller']}>
                <SellerOrders />
              </ProtectedRoute>
            } />
            <Route path="/seller/clients" element={
              <ProtectedRoute allowedRoles={['admin', 'seller']}>
                <SellerClients />
              </ProtectedRoute>
            } />
            <Route path="/seller/inventory" element={
              <ProtectedRoute allowedRoles={['admin', 'seller']}>
                <SellerInventory />
              </ProtectedRoute>
            } />
            <Route path="/seller/settings" element={
              <ProtectedRoute allowedRoles={['admin', 'seller']}>
                <SellerSettings />
              </ProtectedRoute>
            } />
            
            {/* Client Routes */}
            <Route path="/client/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'seller', 'physical', 'juridical']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client/orders" element={
              <ProtectedRoute allowedRoles={['admin', 'seller', 'physical', 'juridical']}>
                <ClientOrders />
              </ProtectedRoute>
            } />
            <Route path="/client/vehicles" element={
              <ProtectedRoute allowedRoles={['admin', 'seller', 'physical', 'juridical']}>
                <ClientVehicles />
              </ProtectedRoute>
            } />
            
            {/* Legacy Routes - Redirect to new structure */}
            <Route path="/dashboard" element={<Navigate to="/client/dashboard" replace />} />
            <Route path="/orders" element={<Navigate to="/client/orders" replace />} />
            <Route path="/kanban" element={<Navigate to="/seller/orders" replace />} />
            <Route path="/clients" element={<Navigate to="/seller/clients" replace />} />
            <Route path="/sellers" element={<Navigate to="/admin/sellers" replace />} />
            <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/profile" element={<Navigate to="/client/settings" replace />} />
            
            {/* Redirect root based on role */}
            <Route path="/" element={<Navigate to="/client/dashboard" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
