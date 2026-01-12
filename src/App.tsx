import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import BlogPostPage from "./pages/BlogPostPage";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import AgendaPage from "./pages/admin/AgendaPage";
import PatientsPage from "./pages/admin/PatientsPage";
import PatientDetailPage from "./pages/admin/PatientDetailPage";
import WaitlistPage from "./pages/admin/WaitlistPage";
import WaitingRoomPage from "./pages/admin/WaitingRoomPage";
import MessagesPage from "./pages/admin/MessagesPage";
import SettingsPage from "./pages/admin/SettingsPage";
import RequestsPage from "./pages/admin/RequestsPage";
import PlanPage from './pages/admin/PlanPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import BlogPage from './pages/admin/BlogPage';
import { ScrollToTop } from './components/ScrollToTop';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="agenda" element={<AgendaPage />} />
            <Route path="pedidos" element={<RequestsPage />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="pacientes/:id" element={<PatientDetailPage />} />
            <Route path="lista-espera" element={<WaitlistPage />} />
            <Route path="sala-espera" element={<WaitingRoomPage />} />
            <Route path="mensagens" element={<MessagesPage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="plano" element={<PlanPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="estatisticas" element={<StatisticsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
