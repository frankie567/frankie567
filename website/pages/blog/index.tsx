import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import MarkdownRenderer from '../../components/MarkdownRenderer';
import * as models from '../../models';
import { getPosts } from '../../services/blog';


interface BlogProps {
  posts: models.BlogPost[];
}

export const getStaticProps: GetStaticProps<BlogProps> = async ({ params }) => {
  const posts = await getPosts(0, 6);
  return { props: { posts } };
};

const Blog: React.FunctionComponent<BlogProps> = ({ posts }) => {
  return (
    <>

    </>
  );
};

export default Blog;
