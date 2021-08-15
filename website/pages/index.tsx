import * as React from 'react';

import AboutMe from '../components/AboutMe';
import CTA from '../components/CTA';
import Expertises from '../components/Expertises';
import FastAPIBook from '../components/FastAPIBook';
import Hero from '../components/Hero';

const Home: React.FunctionComponent = () => {
  return (
    <>
      <Hero />
      <AboutMe />
      <Expertises />
      <CTA />
      <FastAPIBook />
    </>
  );
};

export default Home;
