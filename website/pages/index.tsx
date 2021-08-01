import Image from 'next/image';
import * as React from 'react';

import CTA from '../components/CTA';
import { useCalendly } from '../hooks/calendly';

const Home: React.FunctionComponent = () => {
  const openCalendly = useCalendly();

  return (
    <>
      <section className="relative">

        {/* Illustration behind hero content */}
        {/* <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none" aria-hidden="true">
          <svg width="1360" height="578" viewBox="0 0 1360 578" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="illustration-01">
                <stop stopColor="#FFF" offset="0%" />
                <stop stopColor="#EAEAEA" offset="77.402%" />
                <stop stopColor="#DFDFDF" offset="100%" />
              </linearGradient>
            </defs>
            <g fill="url(#illustration-01)" fillRule="evenodd">
              <circle cx="1232" cy="128" r="128" />
              <circle cx="155" cy="443" r="64" />
            </g>
          </svg>
        </div> */}

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
              <div className="flex justify-center"><Image src="/logos/google.svg" layout="fixed" width="150" height="50" alt="Google" /></div>
              <div className="flex justify-center"><Image src="/logos/google.svg" layout="fixed" width="150" height="50" alt="Google" /></div>
              <div className="flex justify-center"><Image src="/logos/google.svg" layout="fixed" width="150" height="50" alt="Google" /></div>
              <div className="flex justify-center"><Image src="/logos/google.svg" layout="fixed" width="150" height="50" alt="Google" /></div>
            </div>

          </div>

        </div>
      </section>
      <CTA />
    </>
  );
};

export default Home;
