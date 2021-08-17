import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import { useEffect } from 'react';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('python', python);

export const useHighlight = () => {
  useEffect(() => {
    hljs.highlightAll();
  }, []);
};
