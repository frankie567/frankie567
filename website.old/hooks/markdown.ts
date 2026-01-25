import { useEffect, useState } from 'react';

import { Heading, ParsedMarkdown, parseMarkdown } from '../services/markdown';

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
