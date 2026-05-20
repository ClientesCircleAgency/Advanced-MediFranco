import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import BlogListingPage from "./pages/BlogListingPage";
import BlogPostPage from "./pages/BlogPostPage";
import CasosEstudoPage from "./pages/CasosEstudoPage";
import SobreNosPage from "./pages/SobreNosPage";
import EquipaPage from "./pages/EquipaPage";
import MedicinaDentariaPage from "./pages/MedicinaDentariaPage";
import OftalmologiaPage from "./pages/OftalmologiaPage";
import ContactosPage from "./pages/ContactosPage";
import NovoEspacoPage from "./pages/NovoEspacoPage";
import AcademyPage from "./pages/AcademyPage";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import MessagesPage from "./pages/admin/MessagesPage";
import BlogPage from './pages/admin/BlogPage';
import CaseStudiesPage from './pages/admin/CaseStudiesPage';
import { ScrollToTop } from './components/ScrollToTop';

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
            <Route path="/novo-espaco" element={<NovoEspacoPage />} />
            <Route path="/consultas-online" element={<Navigate to="/contactos" replace />} />
            <Route path="/marcar-consulta" element={<Navigate to="/contactos" replace />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/casos-estudo" element={<CasosEstudoPage />} />
            <Route path="/blog" element={<BlogListingPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="blog" replace />} />
              <Route path="mensagens" element={<MessagesPage />} />
              <Route path="casos-estudo" element={<CaseStudiesPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="*" element={<Navigate to="blog" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
