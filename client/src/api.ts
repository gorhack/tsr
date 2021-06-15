import React from "react";
import {
    getOrganizationContains,
    Organization,
    OrganizationActionTypes,
    OrgCacheReducerAction,
} from "./Organization/OrganizationApi";
import {
    EventTaskCategoryActionTypes,
    EventTaskCategoryCacheReducerAction,
    getEventTaskCategoriesContains,
} from "./Event/Task/EventTaskApi";
import sortedUniqBy from "lodash/sortedUniqBy";
import {
    getEventTypeContains,
    EventType,
    EventActionTypes,
    EventTypeCacheReducerAction,
} from "./Event/Type/EventTypeApi";
import {now} from "./dateTimeHelpers/DateProvider";

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    // NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export const MAX_NAME_LENGTH = 255;

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

// TODO user pref, then use user-set timezone with moment-timezone
export const userTimeZone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const currentDateTime = (): Date => {
    return now();
};

export const datePlusYears = (addYears: number): Date => {
    const today = now();
    return new Date(today.getFullYear() + addYears, today.getMonth(), today.getDate());
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

export const orgCacheReducer = (
    state: Organization[],
    action: OrgCacheReducerAction,
): Organization[] => {
    if (action.type === OrganizationActionTypes.LOAD) {
        return sortedUniqBy<Organization>([...state, ...action.organizations], (e) => e.sortOrder);
    } else {
        return state;
    }
};

export const loadEventTypeSearchTerm = async (
    searchTerm: string,
    dispatchToEventTypeCache: React.Dispatch<EventTypeCacheReducerAction>,
): Promise<Option[]> => {
    return getEventTypeContains(searchTerm)
        .then((result) => {
            dispatchToEventTypeCache({ type: EventActionTypes.LOAD, eventTypes: result.items });
            return Promise.resolve(
                result.items.map((eventType) => {
                    return {
                        value: eventType.displayName,
                        label: eventType.displayName,
                    };
                }),
            );
        })
        .catch((error) => {
            console.error(
                `error loading event types with search term ${searchTerm} ${error.message}`,
            );
            return Promise.resolve([]);
        });
};

export const eventTypesCacheReducer = (
    state: EventType[],
    action: EventTypeCacheReducerAction,
): EventType[] => {
    if (action.type === EventActionTypes.LOAD) {
        return action.eventTypes;
    } else {
        return state;
    }
};

// breaks tests when in EventTaskApi due to td...
export const loadTaskCategorySearchTerm = async (
    searchTerm: string,
    dispatchToEventTaskCategoryCache: React.Dispatch<EventTaskCategoryCacheReducerAction>,
): Promise<Option[]> => {
    return getEventTaskCategoriesContains(searchTerm)
        .then((result) => {
            dispatchToEventTaskCategoryCache({
                type: EventTaskCategoryActionTypes.LOAD,
                eventTaskCategories: result.items,
            });
            return Promise.resolve(
                result.items.map((eventTaskCategory) => {
                    return {
                        value: eventTaskCategory.eventTaskDisplayName,
                        label: eventTaskCategory.eventTaskDisplayName,
                    };
                }),
            );
        })
        .catch((error) => {
            console.error(
                `error loading event task categories with search term ${searchTerm} ${error.message}`,
            );
            return Promise.resolve([]);
        });
};
