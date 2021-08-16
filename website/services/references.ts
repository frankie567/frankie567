import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import matter from 'gray-matter';

import * as models from '../models';

const referencesDirectory = join(dirname(process.cwd()), 'references');

export const getReferencesSlugs = async (): Promise<string[]> => {
  const files = await fs.readdir(referencesDirectory, { withFileTypes: true });
  return files
    .filter((file) => file.isFile() && file.name.endsWith('.md'))
    .map((file) => file.name.replace(/\.md$/, ''))
  ;
};

export const getReferenceBySlug = async (slug: string): Promise<models.Reference> => {
  const postPath = join(referencesDirectory, `${slug}.md`);
  const file = await fs.readFile(postPath, { encoding: 'utf-8' });
  const { data, content } = matter(file);
  return {
    title: data.title,
    slug,
    client: data.client,
    year: data.year,
    technologies: data.technologies,
    excerpt: data.excerpt,
    thumbnail: data.thumbnail,
    content,
  };
};

export const getReferences = async (skip?: number, limit?: number): Promise<models.Reference[]> => {
  const slugs = await getReferencesSlugs();
  const references = await Promise.all(slugs.map(getReferenceBySlug));
  return references
    .sort((a, b) => b.year - a.year)
    .slice(skip, skip && limit ? skip + limit : undefined);
};
