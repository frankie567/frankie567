import marked from 'marked';
import { useEffect, useState } from 'react';

interface Heading {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
}

interface ParsedMarkdown {
  html: string;
  headings: Heading[];
}

const parseMarkdown = (input: string): ParsedMarkdown => {
  const headings: Heading[] = [];
  const defaultRenderer = new marked.Renderer();
  const detectSlugger = new marked.Slugger();
  const renderer: marked.RendererObject = {
    heading: (text: string, level, raw: string, slugger: marked.Slugger): string => {
      headings.push({ text, level, slug: detectSlugger.slug(raw) });
      return defaultRenderer.heading(text, level, raw, slugger);
    },
  };
  marked.use({ renderer });
  const html = marked(input);

  return { html, headings };
};

export const useMarkdownParser = (input: string): ParsedMarkdown => {
  const parsed = parseMarkdown(input);
  const [html, setHTML] = useState<string>(parsed.html);
  const [headings, setHeadings] = useState<Heading[]>(parsed.headings);

  useEffect(() => {
    const { html, headings } = parseMarkdown(input);
    setHTML(html);
    setHeadings(headings);
  }, [input]);

  return { html, headings };
};
