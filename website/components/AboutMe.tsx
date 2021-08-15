import Image from 'next/image';
import React from 'react';

const AboutMe: React.FunctionComponent = () => {
  return (
    <section className="relative">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid grid-cols-12 md:gap-6 border-b border-gray-800">
          <div className="w-full max-w-xl md:max-w-none md:w-full mx-auto col-span-12 md:col-span-6 md:mt-6 order-last md:order-first" data-aos="fade-right">
            <Image src="francois-voron-light.jpg" layout="responsive" width="1280" height="1527" alt="François Voron" />
          </div>
          <div className="max-w-xl md:max-w-none md:w-full mx-auto col-span-12 md:col-span-6 md:mt-6 text-center flex items-center order-first md:order-last" data-aos="fade-left">
            <div className="md:pr-4 lg:pr-12 xl:pr-16 mb-8">
              <h2 className="h2 mb-3">Hire one of the best</h2>
              <p className="text-xl text-gray-400">I've {new Date().getFullYear() - 2015} years of experience working as CTO and lead developer in top-level startups in the SaaS industry. My expertise allowed those companies to grow with solid technical foundations and generate thousands of dollars in revenue.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutMe;
