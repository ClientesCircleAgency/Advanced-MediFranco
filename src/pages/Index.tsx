import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ServicesSection } from '@/components/ServicesSection';
import { AppointmentSection } from '@/components/AppointmentSection';
import { BlogSection } from '@/components/BlogSection';
import { TeamSection } from '@/components/TeamSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>MediFranco — Clínica de Oftalmologia e Medicina Dentária em Setúbal</title>
        <meta
          name="description"
          content="Clínica médica em Setúbal com 25+ anos. Oftalmologia, medicina dentária e consultas online. Marque a sua consulta hoje."
        />
        <link rel="canonical" href="https://medifranco.pt/" />
        <meta property="og:title" content="MediFranco — Clínica Médica em Setúbal" />
        <meta
          property="og:description"
          content="Oftalmologia, medicina dentária e consultas online. 25+ anos de experiência em Setúbal."
        />
        <meta property="og:image" content="/og/homepage.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://medifranco.pt/" />
        <meta property="og:locale" content="pt_PT" />
        <meta property="og:site_name" content="MediFranco" />
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <AppointmentSection />
        <ServicesSection />
        <TeamSection />
        <BlogSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
