import React from 'react';

import { useOpenCalendly } from '../hooks/calendly';

const CTA: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  const openCalendly = useOpenCalendly();

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pb-12 md:pb-20">

          {/* CTA box */}
          <div className="bg-gradient-to-r from-red-500 to-pink-400 rounded py-10 px-8 md:py-16 md:px-12 shadow-2xl" data-aos="zoom-y-out">

            <div className="flex flex-col lg:flex-row justify-between items-center">

              {/* CTA content */}
              <div className="mb-6 lg:mr-16 lg:mb-0 text-center lg:text-left">
                <h2 className="h3 text-white mb-2">Ready to kick off your project?</h2>
                <p className="text-white text-lg opacity-75">Let&#39;s have a free 30-minutes call and talk about how we can work together.</p>
              </div>

              {/* CTA button */}
              <div>
                <button onClick={() => openCalendly()} className="btn text-red-500 bg-gradient-to-r from-blue-100 to-white">Book a call</button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default CTA;
