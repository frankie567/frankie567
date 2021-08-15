import { GetStaticPaths, GetStaticProps } from 'next';
import * as React from 'react';

import BlogPosts, { BlogPostsProps } from '../../../components/BlogPosts';
import Metas from '../../../components/Metas';
import { getPostsByTag, getTags } from '../../../services/blog';


export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await getTags();
  return {
    paths: Object.keys(tags).map((tag) => ({ params: { tag } })),
    fallback: false,
  }
};

export const getStaticProps: GetStaticProps<BlogPostsProps> = async ({ params }) => {
  const tag = (params && params.tag) as string;
  const posts = await getPostsByTag(tag, 0);
  const tags = await getTags();
  return { props: { posts, tags, selectedTag: tag } };
};

const BlogTag: React.FunctionComponent<BlogPostsProps> = ({ posts, tags, selectedTag }) => {
  return (
    <>
      <Metas title={`${selectedTag && tags[selectedTag]} - Blog - François Voron`} />
      <BlogPosts posts={posts} tags={tags} selectedTag={selectedTag} />
    </>
  );
};

export default BlogTag;
