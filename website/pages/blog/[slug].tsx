import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import * as React from 'react';

import Metas from '../../components/Metas';
import { useMarkdownParser } from '../../hooks/markdown';
import * as models from '../../models';
import { getPostsSlugs, getPostBySlug } from '../../services/blog';

interface BlogPostProps {
  post: models.BlogPost;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const postsSlugs = await getPostsSlugs();
  return {
    paths: postsSlugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  }
};

export const getStaticProps: GetStaticProps<BlogPostProps> = async ({ params }) => {
  const slug = (params && params.slug) as string;
  const post = await getPostBySlug(slug);
  return { props: { post } };
};

const BlogPost: React.FunctionComponent<BlogPostProps> = ({ post }) => {
  const { html, headings } = useMarkdownParser(post.content);
  return (
    <>
      <Metas
        title={`${post.title} - François Voron`}
        description={post.excerpt}
        image={`${process.env.HOST}${post.thumbnail}`}
        canonical={post.canonical}
      />
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto lg:max-w-none">

              <article>

                {/* Article header */}
                <header className="max-w-3xl mx-auto mb-20">
                  {/* Title */}
                  <h1 className="h1 text-center mb-4">{post.title}</h1>
                </header>

                {/* Article content */}
                <div className="relative lg:flex lg:justify-between">

                  {/* Sidebar */}
                  <aside className="relative hidden lg:block w-64 mr-20 flex-shrink-0 ">
                    <div className="sticky top-1/4">
                      <div className="text-lg font-bold leading-snug tracking-tight mb-4">Table of contents</div>
                      <ul className="font-medium -my-1">
                        {headings.map((heading) =>
                          <li key={heading.slug} className={`py-1 pl-${heading.level * 2 - 2}`}>
                            <a className="flex items-center hover:underline" href={`#${heading.slug}`}>
                              <svg className="w-4 h-4 fill-current text-gray-400 mr-3 flex-shrink-0" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.3 8.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0zM7.3 14.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0zM.3 9.7c-.4-.4-.4-1 0-1.4l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-7 7c-.4.4-1 .4-1.4 0z" />
                              </svg>
                              <span>{heading.text}</span>
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </aside>

                  {/* Main content */}
                  <div>

                    {/* Article meta */}
                    <div className="flex items-center mb-6">
                        <ul className="flex flex-wrap text-xs font-medium -m-1">
                          {post.tags.map((tag) =>
                            <li key={tag} className="mx-1">
                              <span className="inline-flex text-center py-1 px-3 rounded-full bg-red-500">{tag}</span>
                            </li>
                          )}
                        </ul>
                      <span className="text-gray-600 mx-1">·</span>
                      <span className="text-gray-600">{new Date(post.date).toDateString()}</span>
                    </div>
                    <hr className="w-16 h-px pt-px bg-gray-800 border-0 mb-6" />

                    {/* Article body */}
                    <div className="text-lg text-blog-post">
                      <div dangerouslySetInnerHTML={{ __html: html }}></div>
                      <div>
                        <hr className="w-full h-px pt-px mt-8 bg-gray-800 border-0" />
                        <div className="mt-6">
                          <Link href="/blog" passHref>
                            <a className="inline-flex items-center text-base text-red-500 font-medium hover:underline">
                              <svg className="w-3 h-3 fill-current text-red-500 flex-shrink-0 mr-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M.293 5.282L5 .5l1.414 1.436-3 3.048H12v2.032H3.414l3 3.048L5 11.5.293 6.718a1.027 1.027 0 010-1.436z" />
                              </svg>
                              <span>Back to the blog</span>
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
    </>
  );
};

export default BlogPost;
