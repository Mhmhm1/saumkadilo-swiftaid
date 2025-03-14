
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RequestEmergency from "./pages/RequestEmergency";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import RequesterDashboard from "./pages/RequesterDashboard";
import NotificationSettings from "./components/NotificationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/request" element={<RequestEmergency />} />
            <Route path="/dashboard" element={<RequesterDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/notifications" element={<NotificationSettings />} />
            {/* Legacy route paths for backward compatibility */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/requester-dashboard" element={<RequesterDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
