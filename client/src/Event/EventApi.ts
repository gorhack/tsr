import axios, { AxiosResponse } from "axios";
import { PageDTO, PageParams } from "../api";
import { Organization } from "../Organization/OrganizationApi";
import { EventType } from "./Type/EventTypeApi";

const baseUri = "/api/v1/event";

export const saveEvent = async (event: CreatableTsrEvent): Promise<TsrEvent> => {
    try {
        return (await axios.post(baseUri, event)).data as TsrEvent;
    } catch ({ message }) {
        throw new Error(message as string);
    }
};

export const updateEvent = async (event: TsrEvent): Promise<TsrEvent> => {
    try {
        return (await axios.put(baseUri, event)).data;
    } catch ({ message }) {
        throw new Error(message as string);
    }
};

export const getEventById = async (eventId: number): Promise<TsrEvent> => {
    const uri = `${baseUri}/${eventId}`;
    try {
        return (await axios.get(uri)).data;
    } catch ({ message }) {
        throw new Error(message as string);
    }
};

export const getActiveEvents = async (pageParams: PageParams = {}): Promise<PageDTO<TsrEvent>> => {
    const uri = `${baseUri}/active`;
    return axios
        .get(uri, { params: pageParams })
        .then((response: AxiosResponse<PageDTO<TsrEvent>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getActiveEventsByUserId = async (
    pageParams: PageParams = {},
): Promise<PageDTO<TsrEvent>> => {
    const uri = `${baseUri}/active/user`;
    return axios
        .get(uri, { params: pageParams })
        .then((response: AxiosResponse<PageDTO<TsrEvent>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getActiveEventsByOrganizationIds = async (
    pageParams: PageParams = {},
): Promise<PageDTO<TsrEvent>> => {
    const uri = `${baseUri}/active/organizations`;
    return axios
        .get(uri, { params: pageParams })
        .then((response: AxiosResponse<PageDTO<TsrEvent>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export interface CreatableTsrEvent {
    eventId?: number;
    eventName: string;
    organizations: Organization[];
    startDate: string;
    endDate: string;
    eventType?: EventType;
}

export interface TsrEvent {
    eventId: number;
    eventName: string;
    organizations: Organization[];
    startDate: string;
    endDate: string;
    eventType?: EventType;
    audit: Auditable;
}

export interface Auditable {
    createdDate: string;
    createdBy: string;
    createdByDisplayName?: string;
    lastModifiedDate: string;
    lastModifiedBy: string;
    lastModifiedByDisplayName?: string;
}

export enum SocketSubscriptionTopics {
    EVENT_CREATED = "/topic/newEvent/",
    EVENT_UPDATED = "/topic/updateEvent/",
    TASK_CREATED = "/topic/newEventTask/",
    TASK_COMMENT_CREATED = "/topic/newTaskComment/",
}
