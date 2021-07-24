import { GetStaticProps, GetStaticPaths } from 'next';
import * as React from 'react';

import MarkdownRenderer from '../../components/MarkdownRenderer';
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
  return (
    <>
      <h1>{post.title}</h1>
      <MarkdownRenderer content={post.content} />
    </>
  );
};

export default BlogPost;
