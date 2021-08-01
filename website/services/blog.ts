import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import matter from 'gray-matter';

import * as models from '../models';

const postsDirectory = join(dirname(process.cwd()), 'posts');

export const getPostsSlugs = async (): Promise<string[]> => {
  const files = await fs.readdir(postsDirectory, { withFileTypes: true });
  return files
    .filter((file) => file.isFile() && file.name.endsWith('.md'))
    .map((file) => file.name.replace(/\.md$/, ''))
  ;
};

export const getPostBySlug = async (slug: string): Promise<models.BlogPost> => {
  const postPath = join(postsDirectory, `${slug}.md`);
  const file = await fs.readFile(postPath, { encoding: 'utf-8' });
  const { data, content } = matter(file);
  return {
    title: data.title,
    slug,
    date: data.date,
    thumbnail: data.thumbnail,
    content,
  };
};

export const getPosts = async (skip: number, limit: number): Promise<models.BlogPost[]> => {
  const slugs = await getPostsSlugs();
  const posts = await Promise.all(slugs.map(getPostBySlug));
  return posts
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(skip, skip + limit);
};
