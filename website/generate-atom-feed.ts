import { writeFileSync } from 'fs';
import path from 'path';

import { encode } from 'html-entities';

import { getPosts } from './services/blog';
import { parseMarkdown } from './services/markdown';

const generateAtomFeed = async (): Promise<string> => {
  const posts = await getPosts();
  return `
    <feed xmlns="http://www.w3.org/2005/Atom">
    <title>François Voron</title>
    <subtitle>Experiments, thoughts and stories about my work</subtitle>
    <link rel="self" href="${process.env.HOST}/feed.xml" />
    <updated>${posts[0].date}</updated>
    <author>
      <name>François Voron</name>
      <email>contact@francoisvoron.com</email>
    </author>
    <id>${process.env.HOST}/blog</id>
    ${posts.map((post) => {
      return `
        <entry>
          <title>${post.title}</title>
          <link href="${process.env.HOST}/blog/${post.slug}" />
          <id>${process.env.HOST}/blog/${post.slug}</id>
          <updated>${post.date}</updated>
          <summary>${post.excerpt}</summary>
          <content type="html">
            ${encode(parseMarkdown(post.content).html)}
          </content>
        </entry>
      `;
    }).join('')}
    </feed>
  `;
};

const generateAtomFeedFile = async (): Promise<void> => {
  const atom = await generateAtomFeed();
  writeFileSync(path.join(path.dirname(__dirname), 'out', 'feed.xml'), atom, { flag: 'w+' });
};

try {
  generateAtomFeedFile();
} catch (err) {
  process.exit(1);
}
