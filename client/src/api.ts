import moment, { Moment } from "moment";
import React from "react";
import {
    getOrganizationContains,
    OrganizationActionTypes,
    OrgCacheReducerAction,
} from "./Organization/OrganizationApi";

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

export interface Option {
    value: string;
    label: string;
}

export const LONG_DATE_FORMAT = "ddd MMM D, YYYY";

// TODO user pref, then use user-set timezone with moment-timezome
export const userTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const currentTimeUtc = (): Moment => {
    return moment.utc();
};

// breaks tests when in orgApi due to td...
export const loadOrganizationSearchTerm = async (
    searchTerm: string,
    dispatchToOrgCache: React.Dispatch<OrgCacheReducerAction>,
): Promise<Option[]> => {
    return getOrganizationContains(searchTerm)
        .then((result) => {
            dispatchToOrgCache({ type: OrganizationActionTypes.LOAD, organizations: result.items });
            return Promise.resolve(
                result.items.map((organization) => {
                    return {
                        value: organization.organizationDisplayName,
                        label: organization.organizationDisplayName,
                    };
                }),
            );
        })
        .catch((error) => {
            console.error(
                `error loading organizations with search term ${searchTerm} ${error.message}`,
            );
            return Promise.resolve([]);
        });
};
