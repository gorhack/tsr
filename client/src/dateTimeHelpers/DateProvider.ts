import { toDate } from "date-fns-tz";
import { defaultTimeZone } from "./TimeZoneProvider";

export const now = (): Date => {
    return toDate(Date.now(), { timeZone: defaultTimeZone() });
};
