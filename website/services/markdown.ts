import { marked } from 'marked';

export interface Heading {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  slug: string;
}

export interface ParsedMarkdown {
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

export const parseMarkdown = (input: string): ParsedMarkdown => {
  const headings: Heading[] = [];
  const defaultRenderer = new marked.Renderer() as any;
  const detectSlugger = new marked.Slugger();
  const renderer: marked.RendererObject = {
    heading: (text: string, level, raw: string, slugger: marked.Slugger): string | false => {
      headings.push({ text, level, slug: detectSlugger.slug(raw) });
      return defaultRenderer.heading(text, level, raw, slugger);
    },
    image: (href: string | null, title: string | null, text: string): string => {
      const renderedImage = defaultRenderer.image(href, title, text);
      return `<figure>${renderedImage}${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`;
    },
    code: (code: string, language: string | undefined, isEscaped: boolean): string => {
      if (language === 'mermaid') {
        return `<div class="mermaid">${code}</div>`;
      }
      return defaultRenderer.code(code, language, isEscaped);
    },
  };
  // @ts-ignore
  marked.use({ renderer, extensions: [footnote, footnoteRef] });
  const html = marked(input);

  return { html, headings };
};
