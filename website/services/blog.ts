import { readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';

import matter from 'gray-matter';

import * as models from '../models';

const postsDirectory = join(dirname(process.cwd()), 'posts');

export const getPostsSlugs = async (): Promise<string[]> => {
  const files = await readdir(postsDirectory, { withFileTypes: true });
  return files
    .filter((file) => file.isFile() && file.name.endsWith('.md'))
    .map((file) => file.name.replace(/\.md$/, ''))
  ;
};

export const getPostBySlug = async (slug: string): Promise<models.BlogPost> => {
  const postPath = join(postsDirectory, `${slug}.md`);
  const file = await readFile(postPath, { encoding: 'utf-8' });
  const { data, content } = matter(file);
  return {
    title: data.title,
    slug: slug,
    date: data.date,
    content,
  };
};
