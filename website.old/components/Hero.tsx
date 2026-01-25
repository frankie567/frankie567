import Image from 'next/image';
import React from 'react';

import { useOpenCalendly } from '../hooks/calendly';

const Hero: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  const openCalendly = useOpenCalendly();

  return (
    <section className="relative">

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Hero content */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">

          {/* Section header */}
          <div className="text-center pb-12 md:pb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">Software engineer & <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-400">open-source maintainer</span></h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-400 mb-8" data-aos="zoom-y-out" data-aos-delay="150">I'm a seasoned software developer maintaining open-source projects useful for hundreds of businesses</p>
            </div>
          </div>

          {/* Logos */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex justify-center"><Image
              src="/logos/polar.svg"
              className="object-contain"
              width="150"
              height="100"
              alt="Polar" /></div>
            <div className="flex justify-center"><Image
              src="/logos/fief.svg"
              className="object-contain"
              width="150"
              height="100"
              alt="Fief" /></div>
            <div className="flex justify-center"><Image
              src="/logos/fastapi-users.svg"
              className="object-contain"
              width="300"
              height="100"
              alt="FastAPI Users" /></div>
            <div className="flex justify-center"><Image
              src="/logos/packt.svg"
              className="object-contain"
              width="150"
              height="100"
              alt="Packt" /></div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
