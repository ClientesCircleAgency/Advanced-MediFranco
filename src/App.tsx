import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import BlogPostPage from "./pages/BlogPostPage";
import SobreNosPage from "./pages/SobreNosPage";
import EquipaPage from "./pages/EquipaPage";
import MedicinaDentariaPage from "./pages/MedicinaDentariaPage";
import OftalmologiaPage from "./pages/OftalmologiaPage";
import ContactosPage from "./pages/ContactosPage";
import ConsultasOnlinePage from "./pages/ConsultasOnlinePage";
import AcademyPage from "./pages/AcademyPage";
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
import PatientLoginPage from './pages/patient/LoginPage';
import PatientRegisterPage from './pages/patient/RegisterPage';
import PatientResetPasswordPage from './pages/patient/ResetPasswordPage';
import { PatientLayout } from './components/patient/PatientLayout';
import PatientDashboardPage from './pages/patient/DashboardPage';
import PatientAgendaPage from './pages/patient/AgendaPage';
import PatientHistoryPage from './pages/patient/HistoryPage';
import PatientDocumentsPage from './pages/patient/DocumentsPage';
import PatientProfilePage from './pages/patient/ProfilePage';
import PatientSettingsPage from './pages/patient/SettingsPage';

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre-nos" element={<SobreNosPage />} />
            <Route path="/equipa" element={<EquipaPage />} />
            <Route path="/medicina-dentaria" element={<MedicinaDentariaPage />} />
            <Route path="/oftalmologia" element={<OftalmologiaPage />} />
            <Route path="/contactos" element={<ContactosPage />} />
            <Route path="/consultas-online" element={<ConsultasOnlinePage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            {/* Patient auth (public) */}
            <Route path="/area-cliente/login" element={<PatientLoginPage />} />
            <Route path="/area-cliente/registar" element={<PatientRegisterPage />} />
            <Route path="/area-cliente/recuperar-password" element={<PatientResetPasswordPage />} />

            {/* Patient zone (protected) */}
            <Route path="/area-cliente" element={<PatientLayout />}>
              <Route index element={<PatientDashboardPage />} />
              <Route path="agenda" element={<PatientAgendaPage />} />
              <Route path="historico" element={<PatientHistoryPage />} />
              <Route path="documentos" element={<PatientDocumentsPage />} />
              <Route path="perfil" element={<PatientProfilePage />} />
              <Route path="configuracoes" element={<PatientSettingsPage />} />
            </Route>

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
  </HelmetProvider>
);

export default App;
