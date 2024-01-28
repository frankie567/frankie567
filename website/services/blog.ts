import { Article, Configuration, PolarAPI } from '@polar-sh/sdk';
import { promises as fs } from 'fs';
import matter from 'gray-matter';
import { dirname, join } from 'path';

import * as models from '../models';
import { getExcerpt, getImages } from './markdown';

/** Polar source **/
const polar = new PolarAPI(new Configuration({ accessToken: process.env.POLAR_API_KEY }));
const polarSlugPrefix = 'polar-';
const polarTag = 'Polar';

const polarArticleToPost = (article: Article): models.BlogPost => {
  const images = getImages(article.body);
  const excerpt = getExcerpt(article.body);
  return {
    title: article.title,
    slug: `${polarSlugPrefix}${article.slug}`,
    date: article.published_at as string,
    tags: [polarTag],
    canonical: `https://polar.sh/frankie567/posts/${article.slug}`,
    excerpt: excerpt,
    thumbnail: images[0],
    content: article.body,
  };
};

const getPolarPostsSlugs = async (): Promise<string[]> => {
  const { items: articles } = await polar.articles.search({
    platform: 'github',
    organizationName: 'frankie567',
    showUnpublished: false,
  });

  if (!articles) {
    return [];
  }

  return articles.map(({ slug}) => `${polarSlugPrefix}${slug}`);
};

const getPolarPosts = async (): Promise<models.BlogPost[]> => {
  const { items: articles } = await polar.articles.search({
    platform: 'github',
    organizationName: 'frankie567',
    showUnpublished: false,
  });

  if (!articles) {
    return [];
  }

  return articles.map(polarArticleToPost);
};

const getPolarPostBySlug = async (slug: string): Promise<models.BlogPost> => {
  const article = await polar.articles.lookup({
    platform: 'github',
    organizationName: 'frankie567',
    slug,
  });
  return polarArticleToPost(article);
};

/** File source **/

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

export const getPostsSlugs = async (): Promise<string[]> => {
  return [
    ...await getFilePostsSlugs(),
    ...await getPolarPostsSlugs(),
  ];
};

export const getPostBySlug = async (slug: string): Promise<models.BlogPost> => {
  if (slug.startsWith(polarSlugPrefix)) {
    return await getPolarPostBySlug(slug.split(polarSlugPrefix)[1]);
  }
  return await getFilePostBySlug(slug);
};

export const getPosts = async (skip?: number, limit?: number): Promise<models.BlogPost[]> => {
  const posts = [
    ...await getFilePosts(),
    ...await getPolarPosts(),
  ];

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
  tags[normalizeTag(polarTag)] = polarTag;
  return tags;
};

export const getPostsByTag = async (normalizedTag: string, skip?: number, limit?: number): Promise<models.BlogPost[]> => {
  const posts = await getPosts();
  return posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((post) => post.tags.some((tag) => normalizeTag(tag) === normalizedTag))
    .slice(skip, skip && limit ? skip + limit : undefined);
};
