import { useCallback, useContext } from 'react';
import { CalendlyModalContext } from '../components/CalendlyModalProvider';

export const useOpenCalendly = (): () => void => {
  const [show, setShow] = useContext(CalendlyModalContext);

  return useCallback(() => {
    setShow(true);
  }, [setShow]);
};
