import '../website-styles/style.scss';
import 'highlight.js/styles/github-dark.css';
import '../styles.scss';

import AOS from 'aos';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import CalendlyModalProvider from '../components/CalendlyModalProvider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { MermaidContextProvider } from '../components/Mermaid';
import Metas from '../components/Metas';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 700,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EF4444" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="François Voron" />
        <meta property="og:locale" content="en" />
        <meta property="og:url" content={`${process.env.HOST}${router.asPath}`} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:creator" content="@fvoron" />
        <meta property="twitter:site" content="@fvoron" />
        <link href="/feed.xml" type="application/atom+xml" rel="alternate" title="François Voron" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              'url': process.env.HOST,
              'logo': `${process.env.HOST}/logos/francois-voron.svg`,
            }),
          }}
        />
      </Head>
      <Metas />
      <div className="flex flex-col min-h-screen">
        <CalendlyModalProvider>
          <Header />
          <main className="flex-grow">
            <MermaidContextProvider>
              <Component {...pageProps} />
            </MermaidContextProvider>
          </main>
          <Footer />
        </CalendlyModalProvider>
      </div>
    </>
  );
};

export default MyApp;
