import { useCallback, useEffect } from 'react';
import { openPopupWidget } from 'react-calendly';
import ReactGA from 'react-ga';

import { AnalyticsEvent } from '../models';

enum CalendlyEvent {
  PROFILE_PAGE_VIEWED = 'calendly.profile_page_viewed',
  EVENT_TYPE_VIEWED = 'calendly.event_type_viewed',
  DATE_AND_TIME_SELECTED = 'calendly.date_and_time_selected',
  EVENT_SCHEDULED = 'calendly.event_scheduled'
}

export const useCalendly = (): () => void => {
  useEffect(() => {
    const handleEvent = (e: MessageEvent) => {
      const eventName = e.data.event;
      if (eventName === CalendlyEvent.EVENT_SCHEDULED) {
        ReactGA.event({ category: 'All', action: AnalyticsEvent.CALENDLY_BOOKED });
      }
    };
    window.addEventListener('message', handleEvent);

    return () => window.removeEventListener('message', handleEvent);
  }, []);

  return useCallback(() => {
    ReactGA.event({ category: 'All', action: AnalyticsEvent.CALENDLY_OPENED });
    openPopupWidget({
      url: 'https://calendly.com/fvoron/30min',
      pageSettings: {
        hideEventTypeDetails: false,
        hideLandingPageDetails: false,
      },
    });
  }, []);
};
