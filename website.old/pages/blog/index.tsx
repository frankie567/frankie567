import { GetStaticProps } from 'next';
import * as React from 'react';

import BlogPosts, { BlogPostsProps } from '../../components/BlogPosts';
import Metas from '../../components/Metas';
import { getPosts, getTags } from '../../services/blog';

export const getStaticProps: GetStaticProps<BlogPostsProps> = async () => {
  const posts = await getPosts(0);
  const tags = await getTags();
  return { props: { posts, tags } };
};

const Blog: React.FunctionComponent<React.PropsWithChildren<BlogPostsProps>> = ({ posts, tags }) => {
  return (
    <>
      <Metas title="Blog - François Voron" />
      <BlogPosts posts={posts} tags={tags} />
    </>
  );
};

export default Blog;
