import hljs from 'highlight.js/lib/core';
import { useEffect } from 'react';

hljs.registerLanguage('bash', require('/node_modules/highlight.js/lib/languages/bash'));
hljs.registerLanguage('python', require('/node_modules/highlight.js/lib/languages/python'));

export const useHighlight = () => {
  useEffect(() => {
    hljs.highlightAll();
  }, []);
};
