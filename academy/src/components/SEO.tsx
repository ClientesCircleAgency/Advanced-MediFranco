import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title: string
    description: string
    path?: string
    ogType?: string
    jsonLd?: object
}

const BASE_URL = 'https://academy.medifranco.pt'
const SITE_NAME = 'MediFranco Academy'

export function SEO({ title, description, path = '', ogType = 'website', jsonLd }: SEOProps) {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
    const url = `${BASE_URL}${path}`

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={SITE_NAME} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />

            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    )
}
