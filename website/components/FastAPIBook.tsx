import Image from 'next/image';
import React from 'react';

const FastAPIBook: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  return (
    <section className="relative">
      <div className="pb-12 md:pb-20">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid grid-cols-12 md:gap-6">
            <div className="max-w-xl md:max-w-none md:w-full mx-auto col-span-12 md:col-span-8 md:mt-6 text-center flex items-center" data-aos="fade-right">
              <div className="md:pr-4 lg:pr-12 xl:pr-16 mb-8">
                <h2 className="h2 mb-3">Author of the best-seller book about FastAPI</h2>
                <p className="text-xl text-gray-400">I'm one of the top experts in the FastAPI community, the #3 most-used web Python framework behind Django and Flask. In collaboration with Packt, one of the leading tech book publishers in the UK, I've wrote a book to learn all the secrets of this framework and how data scientists can leverage its power to build efficient and reliable data science applications.</p>
                <a href="https://www.amazon.com/dp/1801079218" className="btn text-white bg-red-500 hover:bg-red-600 w-full mt-4 sm:w-auto">Learn more</a>
              </div>
            </div>
            <div className="w-full max-w-xl md:max-w-none md:w-full mx-auto col-span-12 md:col-span-4 md:mt-6 order-last" data-aos="fade-left">
              <Image
                src="/fastapi-book.png"
                width="800"
                height="988"
                alt="Building Data Science Applications with FastAPI"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FastAPIBook;
