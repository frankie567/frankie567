import { useCallback } from 'react';
import { openPopupWidget } from 'react-calendly';

export const useCalendly = (): () => void => {
  return useCallback(() => {
    openPopupWidget({
      url: 'https://calendly.com/fvoron/30min',
      pageSettings: {
        hideEventTypeDetails: false,
        hideLandingPageDetails: false,
      },
    });
  }, []);
};
