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
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">Make your software projects <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-400">successful</span></h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-400 mb-8" data-aos="zoom-y-out" data-aos-delay="150">I build high-quality softwares with the best technologies to achieve your business goals in a fast-changing environment.</p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
                <div>
                  <button onClick={() => openCalendly()} className="btn text-white cursor-pointer bg-red-500 hover:bg-red-600 w-full mb-4 sm:w-auto">Book a call</button>
                  <p className="text-xs">Free 30-minutes call to talk about your project</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex justify-center items-center"><Image src="/logos/juniper.png" layout="fixed" width="150" height="41" alt="Juniper YC 2021" /></div>
            <div className="flex justify-center"><Image src="/logos/datiplus.png" layout="fixed" width="150" height="85" alt="DatiPlus" /></div>
            <div className="flex justify-center"><Image src="/logos/ministere-economie-finances.svg" layout="fixed" width="150" height="100" alt="Ministère de l'Économie, des Finances et de la Relance" /></div>
            <div className="flex justify-center"><Image src="/logos/beemydesk.svg" layout="fixed" width="150" height="100" alt="BeeMyDesk" /></div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;
