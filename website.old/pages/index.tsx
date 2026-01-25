import * as React from 'react';

import AboutMe from '../components/AboutMe';
import Expertises from '../components/Expertises';
import FastAPIBook from '../components/FastAPIBook';
import Hero from '../components/Hero';
import Metas from '../components/Metas';
import Testimonials from '../components/Testimonials';

const Home: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  return (
    <>
      <Metas title="François Voron - Software engineer & open-source maintainer" />
      <Hero />
      <AboutMe />
      <Testimonials />
      <Expertises />
      <FastAPIBook />
    </>
  );
};

export default Home;
