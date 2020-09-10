import { DateTime } from "luxon";

export const doNothing = (): void => {
    // do nothing, fixing ESlint's issues with empty arrow functions
};

export const dateFormat = (dateString: string, format?: string): string => {
    if (format) {
        return DateTime.fromISO(dateString, { zone: "utc" }).toFormat(format);
    }
    return DateTime.fromISO(dateString, { zone: "utc" }).toFormat("dd-MMM-yyyy").toUpperCase();
};
