
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Kanban from "./pages/Kanban";
import NotFound from "./pages/NotFound";

// Create a query client
const queryClient = new QueryClient();

const App = () => (
  // Important: BrowserRouter must be the outermost router wrapper
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes - Admin Only */}
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Settings Page - Under Construction</div>
              </ProtectedRoute>
            } />
            <Route path="/sellers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Sellers Page - Under Construction</div>
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - Admin and Seller */}
            <Route path="/kanban" element={
              <ProtectedRoute allowedRoles={['admin', 'seller']}>
                <Kanban />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute allowedRoles={['admin', 'seller']}>
                <div>Clients Page - Under Construction</div>
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - All authenticated users */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <div>Orders Page - Under Construction</div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div>Profile Page - Under Construction</div>
              </ProtectedRoute>
            } />
            
            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
