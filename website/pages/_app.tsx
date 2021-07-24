import type { AppProps } from 'next/app';

import Footer from '../components/Footer';
import Header from '../components/Header';

import 'bootstrap/scss/bootstrap.scss';
import '../website-styles/scss/style.scss';
import '../styles.scss';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <div className="active-dark bg_color--9">
      <Header />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
};

export default MyApp;
