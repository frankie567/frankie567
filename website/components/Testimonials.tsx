import Image from 'next/image';
import React, { useState } from 'react';

import Transition from './Transition';

const Testimonials: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  const [active, setActive] = useState(0);
  const [items] = useState([
    {
      img: '/testimonials/jade-camber.jpg',
      alt: 'Jade Chan - Camber Health',
      quote: 'François has been tremendously helpful to the development of our platform. Each of his responses has been extremely detailed and thorough, with code snippets, examples, recommendations, and hyperlinks to various resources.\nFrançois is clearly a subject matter expert in FastAPI and Python, and has been an incredible value-add to our team.',
      name: 'Jade Chan',
      role: 'Head of Engineering',
      team: 'Camber Health',
      link: 'https://www.camber.health',
    },
    {
      img: '/testimonials/jeremie-datiplus.jpg',
      alt: 'Jérémie Bennegent - DatiPlus',
      quote: 'Every mission with François was a success: high quality code and documentation, deadlines met.\nFrançois knows how to step back and have a clear vision of our challenges to help us take the best decisions.',
      name: 'Jérémie Bennegent',
      role: 'CTO',
      team: 'DatiPlus',
      link: 'https://dati-plus.com',
    },
  ]);

  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-12 md:pt-20">

          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h2 className="h2 mb-4">I'm trusted by the most innovative companies</h2>
          </div>

          {/* Carousel area */}
          <div className="max-w-3xl mx-auto">

            {/* Carousel */}
            <div className="relative" data-aos="zoom-y-out">

              {/* Testimonials */}
              <div className="relative flex items-start ring-2 ring-opacity-75 ring-red-500 rounded z-10">

                {items.map((item, index) => (
                  <Transition
                    key={index}
                    show={active === index}
                    appear={true}
                    className="text-center px-12 py-8 pt-20 mx-4 md:mx-0"
                    enter="transition ease-in-out duration-700 transform order-first"
                    enterStart="opacity-0 -translate-y-8"
                    enterEnd="opacity-100 scale-100"
                    leave="transition ease-in-out duration-300 transform absolute"
                    leaveStart="opacity-100 translate-y-0"
                    leaveEnd="opacity-0 translate-y-8"
                  >
                    <div className="absolute top-0 -mt-12 left-1/2 transform -translate-x-1/2">
                      <Image
                        className="relative rounded-full"
                        src={item.img}
                        width="96"
                        height="96"
                        alt={item.alt} />
                    </div>
                    <blockquote className="text-xl font-medium mb-4 whitespace-pre-line">{item.quote}</blockquote>
                    <cite className="block font-bold text-lg not-italic mb-1">{item.name}</cite>
                    <div className="text-gray-600">
                      <span>{item.role}</span> — <a className="text-red-500 hover:underline" href={item.link}>{item.team}</a>
                    </div>
                  </Transition>
                ))}

              </div>

              {/* Arrows */}
              <div className="absolute inset-0 flex items-center justify-between">
                <button
                  className="relative z-20 w-16 h-16 p-1 flex items-center justify-center bg-red-500 rounded-full shadow-md hover:shadow-lg transform -translate-x-2 md:-translate-x-1/2"
                  onClick={() => { setActive(active === 0 ? items.length - 1 : active - 1); }}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
                  </svg>
                </button>
                <button
                  className="relative z-20 w-16 h-16 p-1 flex items-center justify-center bg-red-500 rounded-full shadow-md hover:shadow-lg transform translate-x-2 md:translate-x-1/2"
                  onClick={() => { setActive(active === items.length - 1 ? 0 : active + 1); }}
                >
                  <span className="sr-only">Next</span>
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.3 14.7l-1.4-1.4L12.2 9H0V7h12.2L7.9 2.7l1.4-1.4L16 8z" />
                  </svg>
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
