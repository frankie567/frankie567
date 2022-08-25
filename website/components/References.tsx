import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import * as models from '../models';

export interface ReferencesProps {
  references: models.Reference[];
}

const References: React.FunctionComponent<React.PropsWithChildren<ReferencesProps>> = ({ references }) => {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">

          {/* Page header */}
          <div className="max-w-3xl pb-12 md:pb-20 text-center md:text-left">
            <h1 className="h1">
              Happy clients who trusted me for their projects.
            </h1>
          </div>

          {/* References list */}
          <div className="max-w-sm mx-auto md:max-w-none">

            {/* References container */}
            <div className="grid gap-12 md:grid-cols-3 md:gap-x-6 md:gap-y-8 items-start">
              {references.map((reference) =>
                <div key={reference.slug} className="flex flex-col h-full" data-aos="zoom-y-out">
                  <header>
                    <Link href="/references/[slug]" as={`/references/${reference.slug}`} passHref>
                      <a className="block mb-6" >
                        <figure className="relative h-0 pb-9/16 overflow-hidden translate-z-0 rounded">
                          <Image className="absolute inset-0 w-full h-full object-cover transform scale-105 hover:-translate-y-1 transition duration-700 ease-out" src={reference.thumbnail} layout="responsive" width="352" height="198" alt={reference.title} />
                        </figure>
                      </a>
                    </Link>
                    <div className="mb-3">
                      <ul className="flex flex-wrap text-xs font-medium -m-1">
                        <li className="m-1">
                          <span className="inline-flex text-center py-1 px-3 rounded-full bg-red-500">{reference.client}</span>
                        </li>
                        <li className="m-1">
                          <span className="inline-flex text-center py-1 px-3 rounded-full bg-gray-800">{reference.year}</span>
                        </li>
                      </ul>
                    </div>
                    <h2 className="text-xl font-bold leading-snug tracking-tight mb-2">
                      <Link href="/references/[slug]" as={`/references/${reference.slug}`} passHref><a className="hover:underline">{reference.title}</a></Link>
                    </h2>
                  </header>
                  <p className="text-gray-400 flex-grow">{reference.excerpt}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default References;
