import { utcToZonedTime } from "date-fns-tz";
import { defaultTimeZone } from "./TimeZoneProvider";

export const getZonedDateTime = (
    dateString: string | number,
): { zonedDateTime: Date; timeZone: string } => {
    const timeZone = defaultTimeZone();
    return {
        zonedDateTime: utcToZonedTime(new Date(dateString), timeZone),
        timeZone,
    };
};
