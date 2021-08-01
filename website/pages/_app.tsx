import AOS from 'aos';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

import Footer from '../components/Footer';
import Header from '../components/Header';

import '../website-styles/style.scss';
import '../styles.scss';

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 700,
      easing: 'ease-out-cubic',
    });
  });

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Header />
      <main className="flex-grow">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  );
};

export default MyApp;
