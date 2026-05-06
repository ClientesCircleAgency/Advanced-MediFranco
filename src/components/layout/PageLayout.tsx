import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PageLayoutProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  description,
  path = '',
  ogImage,
  noIndex = false,
  children,
}: PageLayoutProps) {
  const canonicalUrl = `https://medifranco.pt${path}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="MediFranco" />
        <meta property="og:locale" content="pt_PT" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
