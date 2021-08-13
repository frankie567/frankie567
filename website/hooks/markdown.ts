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

interface FootnoteRefToken {
  type: 'footnoteRef',
  raw: string;
  reference: string;
}

const footnoteRef = {
  name: 'footnoteRef',
  level: 'inline',
  start(src: string): number | undefined {
    return src.match(/\[\^/)?.index;
  },
  tokenizer(src: string, tokens: marked.Token[]): FootnoteRefToken | undefined {
    const rule = /^\[\^([^\]]+)\](?!\:)/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: 'footnoteRef',
        raw: match[0],
        reference: match[1],
      };
    }
  },
  renderer(token: FootnoteRefToken): string {
    return `<sup><a href="#footnote:${token.reference}">${token.reference}</a></sup>`;
  },
};

interface FootnoteToken {
  type: 'footnote',
  raw: string;
  reference: string;
  text: marked.TokensList;
}

const footnote = {
  name: 'footnote',
  level: 'block',
  start(src: string): number | undefined {
    return src.match(/\[\^/)?.index;
  },
  tokenizer(src: string, tokens: marked.Token[]): FootnoteToken | undefined {
    const rule = /^\[\^([^\]]+)\]\:(.*)\n/;
    const match = rule.exec(src);
    if (match) {
      const lexer = new marked.Lexer();
      return {
        type: 'footnote',
        raw: match[0],
        reference: match[1],
        // @ts-ignore
        text: lexer.inlineTokens(match[2].trim()),
      };
    }
  },
  renderer(token: FootnoteToken): string {
    const parser = new marked.Parser();
    const renderer = new marked.Renderer();
    return `<p><sup id="footnote:${token.reference}">${token.reference}</sup> ${parser.parseInline(token.text, renderer)}</p>`;
  },
};

const parseMarkdown = (input: string): ParsedMarkdown => {
  const headings: Heading[] = [];
  const defaultRenderer = new marked.Renderer();
  const detectSlugger = new marked.Slugger();
  const renderer: marked.RendererObject = {
    heading: (text: string, level, raw: string, slugger: marked.Slugger): string => {
      headings.push({ text, level, slug: detectSlugger.slug(raw) });
      return defaultRenderer.heading(text, level, raw, slugger);
    },
    image: (href: string | null, title: string | null, text: string): string => {
      const renderedImage = defaultRenderer.image(href, title, text);
      return `<figure>${renderedImage}${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`;
    },
  };
  // @ts-ignore
  marked.use({ renderer, extensions: [footnote, footnoteRef] });
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
