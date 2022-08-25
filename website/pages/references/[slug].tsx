import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import * as React from 'react';
import CTA from '../../components/CTA';

import Metas from '../../components/Metas';
import { useMarkdownParser } from '../../hooks/markdown';
import * as models from '../../models';
import { getReferenceBySlug, getReferencesSlugs } from '../../services/references';

interface ReferenceProps {
  reference: models.Reference;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const referencesSlugs = await getReferencesSlugs();
  return {
    paths: referencesSlugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
};

export const getStaticProps: GetStaticProps<ReferenceProps> = async ({ params }) => {
  const slug = (params && params.slug) as string;
  const reference = await getReferenceBySlug(slug);
  return { props: { reference } };
};

const Reference: React.FunctionComponent<React.PropsWithChildren<ReferenceProps>> = ({ reference }) => {
  const { html, headings } = useMarkdownParser(reference.content);
  return (
    <>
      <Metas
        title={`${reference.title} - François Voron`}
        description={reference.excerpt}
        image={`${process.env.HOST}${reference.thumbnail}`}
      />
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto lg:max-w-none">

              <article>

                {/* Header */}
                <header className="max-w-3xl mx-auto mb-20">
                  {/* Title */}
                  <h1 className="h1 text-center mb-4">{reference.title}</h1>
                </header>

                {/* Content */}
                <div className="relative lg:flex lg:justify-between">

                  {/* Sidebar */}
                  <aside className="relative w-full lg:w-64 mr-20 flex-shrink-0 ">
                    <dl>
                      <dt className="text-lg font-bold leading-snug tracking-tight">Client</dt>
                      <dd className="mb-4">{reference.client}</dd>

                      <dt className="text-lg font-bold leading-snug tracking-tight">Year</dt>
                      <dd className="mb-4">{reference.year}</dd>

                      <dt className="text-lg font-bold leading-snug tracking-tight">Technologies</dt>
                      <dd className="mb-4">
                        {reference.technologies.map((technology) =>
                          <span key={technology} className="inline-flex text-center py-1 px-3 rounded-full bg-gray-800 mr-1 mb-1">{technology}</span>
                        )}
                      </dd>
                    </dl>
                  </aside>

                  {/* Main content */}
                  <div>
                    {/* Article body */}
                    <div className="text-lg text-reference">
                      <div dangerouslySetInnerHTML={{ __html: html }}></div>
                      <div>
                        <hr className="w-full h-px pt-px mt-8 bg-gray-800 border-0" />
                        <div className="mt-6">
                          <Link href="/references" passHref>
                            <a className="inline-flex items-center text-base text-red-500 font-medium hover:underline">
                              <svg className="w-3 h-3 fill-current text-red-500 flex-shrink-0 mr-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M.293 5.282L5 .5l1.414 1.436-3 3.048H12v2.032H3.414l3 3.048L5 11.5.293 6.718a1.027 1.027 0 010-1.436z" />
                              </svg>
                              <span>References</span>
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Article footer */}
              </article>

            </div>

          </div>
        </div>
      </section>
      <CTA />
    </>
  );
};

export default Reference;
