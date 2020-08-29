import moment, { Moment } from "moment";

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    // NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export interface SelectOption {
    id: number;
    label: string;
}

// TODO user pref, then use user-set timezone with moment-timezome
export const userTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const currentTime = (): Moment => {
    return moment();
};
