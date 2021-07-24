import * as React from 'react';
import marked from 'marked';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FunctionComponent<MarkdownRendererProps> = ({ content }) => {
  const parsed = marked(content);
  return <div dangerouslySetInnerHTML={{ __html: parsed }}></div>;
};

export default MarkdownRenderer;
