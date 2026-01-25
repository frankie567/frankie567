import { createContext, useRef, useState } from 'react';
import { PopupModal } from 'react-calendly';


export const CalendlyModalContext = createContext<[boolean, (show: boolean) => void]>([false, () => { }]);

const CalendlyModalProvider: React.FunctionComponent<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [show, setShow] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  return (
    <CalendlyModalContext.Provider value={[show, setShow]}>
      {children}
      <div id="calendly-root" ref={root}></div>
      {root && root.current &&
        <PopupModal
          url="https://calendly.com/fvoron/30min"
          pageSettings={{
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
          }}
          onModalClose={() => setShow(false)}
          open={show}
          /*
          * react-calendly uses React's Portal feature (https://reactjs.org/docs/portals.html) to render the popup modal. As a result, you'll need to
          * specify the rootElement property to ensure that the modal is inserted into the correct domNode.
          */
          rootElement={root.current}
        />
      }
    </CalendlyModalContext.Provider>
  );
};

export default CalendlyModalProvider;
