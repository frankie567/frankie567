import { decode } from 'html-entities';
import { marked, RendererObject,Token, Tokens, TokensList } from 'marked';
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
      return {
        type: 'footnote',
        raw: match[0],
        reference: match[1],
        // @ts-ignore
        text: this.lexer.inlineTokens(match[2].trim()),
      };
    }
  },
  renderer(token: FootnoteToken): string {
    // @ts-ignore
    return `<p><sup id="footnote:${token.reference}">${token.reference}</sup> ${this.parser.parseInline(token.text)}</p>`;
  },
};

export const parseMarkdown = (input: string): ParsedMarkdown => {
  let headings: Heading[] = [];
  const defaultRenderer = new marked.Renderer() as any;
  const renderer: RendererObject = {
    image: ({ href, title, text }: Tokens.Image): string => {
      const renderedImage = defaultRenderer.image({ href, title, text });
      return `<figure>${renderedImage}${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`;
    },
    code: ({ text, lang, escaped }: Tokens.Code): string => {
      if (lang === 'mermaid') {
        return `<div class="mermaid">${text}</div>`;
      }
      return defaultRenderer.code({ text, lang, escaped });
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
