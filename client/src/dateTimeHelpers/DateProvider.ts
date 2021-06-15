import { toDate } from 'date-fns-tz';
import { defaultTimeZone } from './TimeZoneProvider';

export const now = () => {
  return toDate(Date.now(), { timeZone: defaultTimeZone() });
};
