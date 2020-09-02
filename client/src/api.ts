import moment, { Moment } from "moment";

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    // NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export interface PageDTO<T> {
    items: T[];
    totalResults: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
    first: boolean;
    last: boolean;
}

export const emptyPage: PageDTO<never> = {
    items: [],
    totalResults: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0,
    first: true,
    last: true,
};

export type PageParams = {
    page?: number;
    size?: number;
    sortBy?: string;
};

export interface SelectOption {
    id: number;
    label: string;
}

// TODO user pref, then use user-set timezone with moment-timezome
export const userTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const currentTimeUtc = (): Moment => {
    return moment.utc();
};

export const currentTimeLocal = (): string => {
    return moment(new Date()).format("YYYY-MM-DDTHH:mm:ssZ");
};
