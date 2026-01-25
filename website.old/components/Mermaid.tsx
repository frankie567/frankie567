import Script from 'next/script';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';

interface MermaidContextInterface {
  loaded: boolean;
  toggleLoaded: () => void;
}

const MermaidLoadedContext = React.createContext<MermaidContextInterface>({ loaded: false, toggleLoaded: () => { } });

export const MermaidContextProvider: React.FunctionComponent<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  return (
    <MermaidLoadedContext.Provider value={{ loaded: mermaidLoaded, toggleLoaded: () => setMermaidLoaded(true) }}>
      {children}
    </MermaidLoadedContext.Provider>
  );
};

export const MermaidScript: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  const { toggleLoaded } = useContext(MermaidLoadedContext);

  const onMermaidLoaded = () => {
    toggleLoaded();
    // @ts-ignore
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
  };

  return (
    <Script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js" onLoad={onMermaidLoaded} />
  );
};

export const useMermaid = () => {
  const { loaded } = useContext(MermaidLoadedContext);

  useEffect(() => {
    if (loaded) {
      // @ts-ignore
      mermaid.contentLoaded();
    }
  }, [loaded]);
};
