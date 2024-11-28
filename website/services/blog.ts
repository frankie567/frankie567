import { promises as fs } from 'fs';
import matter from 'gray-matter';
import { dirname, join } from 'path';

import * as models from '../models';

const postsDirectory = join(dirname(process.cwd()), 'posts');

const getFilePostsSlugs = async (): Promise<string[]> => {
  const files = await fs.readdir(postsDirectory, { withFileTypes: true });
  return files
    .filter((file) => file.isFile() && file.name.endsWith('.md'))
    .map((file) => file.name.replace(/\.md$/, ''));
};

const getFilePostBySlug = async (slug: string): Promise<models.BlogPost> => {
  const postPath = join(postsDirectory, `${slug}.md`);
  const file = await fs.readFile(postPath, { encoding: 'utf-8' });
  const { data, content } = matter(file);
  return {
    title: data.title,
    slug,
    date: data.date,
    tags: data.tags,
    ...(data.canonical ? { canonical: data.canonical } : {}),
    excerpt: data.excerpt,
    thumbnail: data.thumbnail,
    content,
  };
};

const getFilePosts = async (): Promise<models.BlogPost[]> => {
  const slugs = await getFilePostsSlugs();
  return await Promise.all(slugs.map(getFilePostBySlug));
};

/** Exposed functions **/

export const getPostsSlugs = getFilePostsSlugs;

export const getPostBySlug = getFilePostBySlug;

export const getPosts = async (skip?: number, limit?: number): Promise<models.BlogPost[]> => {
  const posts = await getFilePosts();
  return posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(skip, skip && limit ? skip + limit : undefined);
};

/** Tags */

export const normalizeTag = (tag: string): string => {
  return tag.toLowerCase().replace(/\s+/g, '-');
};

export const getTags = async (): Promise<Record<string, string>> => {
  const posts = await getFilePosts();
  const tags: Record<string, string> = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      const normalizedTag = normalizeTag(tag);
      tags[normalizedTag] = tag;
    }
  }
  return tags;
};

export const getPostsByTag = async (normalizedTag: string, skip?: number, limit?: number): Promise<models.BlogPost[]> => {
  const posts = await getPosts();
  return posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((post) => post.tags.some((tag) => normalizeTag(tag) === normalizedTag))
    .slice(skip, skip && limit ? skip + limit : undefined);
};
