import { decode } from 'html-entities';
import { marked, RendererObject,Token, TokensList } from 'marked';
import { getHeadingList,gfmHeadingId } from 'marked-gfm-heading-id';

export interface Heading {
  text: string;
  level: number;
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
  tokenizer(src: string, tokens: Token[]): FootnoteRefToken | undefined {
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
  text: TokensList;
}

const footnote = {
  name: 'footnote',
  level: 'block',
  start(src: string): number | undefined {
    return src.match(/\[\^/)?.index;
  },
  tokenizer(src: string, tokens: Token[]): FootnoteToken | undefined {
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
  let headings: Heading[] = [];
  const defaultRenderer = new marked.Renderer() as any;
  const renderer: RendererObject = {
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
  marked.use({ renderer, extensions: [footnote, footnoteRef], mangle: false, headerIds: true });
  marked.use(
    gfmHeadingId({prefix: 'header-'}),
    {
      hooks: {
        postprocess(html) {
          headings = getHeadingList().map((heading) => ({ text: decode(heading.text), level: heading.level, slug: heading.id }));
          return html;
      },
    },
  });
  const html = marked.parse(input, { async: false }) as string;

  return { html, headings };
};

export const getExcerpt = (input: string): string => {
  const renderer: RendererObject = {
    heading: (text: string, level: number, raw: string): string | false => {
      return text;
    },
    code: (code: string, language: string | undefined, isEscaped: boolean): string => {
      return code;
    },
    paragraph: (text: string): string => {
      return text;
    },
    strong(text: string) {
      return text;
    },
    em(text: string) {
      return text;
    },
    codespan(text: string) {
      return text;
    },
    del(text: string) {
      return text;
    },
    html(text: string) {
      return text;
    },
    text(text: string) {
      return text;
    },
    link(href: string, title: string | null | undefined, text: string) {
      return '' + text;
    },
    image(href: string, title: string | null, text: string) {
      return '' + text;
    },
    br() {
      return '';
    },
  };
  marked.use({ renderer });
  const html = marked.parse(input.slice(0, 140), { async: false }) as string;
  return decode(html);
};

export const getImages = (input: string): string[] => {
  let images: string[] = [];
  const walkTokens = (token: Token) => {
    if (token.type === 'image') {
      images.push(token.href);
    }
  };

  marked.use({ walkTokens });
  marked.parse(input);
  return images;
};
