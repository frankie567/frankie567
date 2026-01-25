import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import * as models from '../models';

export interface BlogPostsProps {
  posts: models.BlogPost[];
  tags: Record<string, string>;
  selectedTag?: string;
}

const BlogPosts: React.FunctionComponent<React.PropsWithChildren<BlogPostsProps>> = ({ posts, tags, selectedTag }) => {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">

          {/* Page header */}
          <div className="max-w-3xl pb-12 md:pb-20 text-center md:text-left">
            <h1 className="h1">
              {!selectedTag && 'Experiments, thoughts and stories about my work'}
              {selectedTag && tags[selectedTag]}
            </h1>
          </div>

          {/* Section tags */}
          <div className="border-b border-gray-800 pb-4 mb-12">
            <ul className="flex flex-wrap justify-center md:justify-start font-medium -mx-5 -my-1">
              <li className="mx-5 my-1">
                <Link href="/blog" className={`${!selectedTag ? 'text-red-500' : 'hover:underline'}`}>
                  All
                </Link>
              </li>
              {Object.keys(tags).sort((tag1, tag2) => tag1.localeCompare(tag2)).map((tag) =>
                <li key={tag} className="mx-5 my-1">
                  <Link href="/blog/tag/[tag]" as={`/blog/tag/${tag}`} className={`${tag === selectedTag ? 'text-red-500' : 'hover:underline'}`}>
                    {tags[tag]}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Articles list */}
          <div className="max-w-sm mx-auto md:max-w-none">

            {/* Articles container */}
            <div className="grid gap-12 md:grid-cols-3 md:gap-x-6 md:gap-y-8 items-start">
              {posts.map((post) =>
                <article key={post.slug} className="flex flex-col h-full" data-aos="zoom-y-out">
                  <header>
                    <Link href="/blog/[slug]" as={`/blog/${post.slug}`} className="block mb-6">
                      <figure className="relative h-0 pb-9/16 overflow-hidden translate-z-0 rounded">
                        <Image
                          className="absolute inset-0 w-full h-full object-cover transform scale-105 hover:-translate-y-1 transition duration-700 ease-out"
                          src={post.thumbnail}
                          width="352"
                          height="198"
                          alt={post.title}
                          sizes="100vw"
                        />
                      </figure>
                    </Link>
                    <div className="mb-3">
                      <ul className="flex flex-wrap text-xs font-medium -m-1">
                        {post.tags.map((tag) =>
                          <li key={tag} className="m-1">
                            <span className="inline-flex text-center py-1 px-3 rounded-full bg-red-500">{tag}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    <h2 className="text-xl font-bold leading-snug tracking-tight mb-2">
                      <Link href="/blog/[slug]" as={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                    </h2>
                  </header>
                  <p className="text-gray-400 flex-grow">{post.excerpt}</p>
                </article>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPosts;
