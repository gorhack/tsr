import axios, { AxiosResponse } from "axios";
import { PageDTO, PageParams } from "../api";
import { Organization } from "../Organization/OrganizationApi";
import { EventType } from "./Type/EventTypeApi";

const baseUri = "/api/v1/event";

export const saveEvent = async (event: CreatableTsrEvent): Promise<TsrEvent> => {
    try {
        return (await axios.post(baseUri, event)).data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const updateEvent = async (event: TsrEvent): Promise<TsrEvent> => {
    try {
        return (await axios.put(baseUri, event)).data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getEventById = async (eventId: number): Promise<TsrEvent> => {
    const uri = `${baseUri}/${eventId}`;
    try {
        return toTsrEvent((await axios.get(uri)).data);
    } catch (error) {
        throw new Error(error.message);
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
    startDate: Date;
    endDate: Date;
    eventType?: EventType;
}

interface TsrEventDto {
    eventId: number;
    eventName: string;
    organizations: Organization[];
    startDate: string;
    endDate: string;
    eventType?: EventType;
    audit: Auditable;
}

export interface TsrEvent {
    eventId: number;
    eventName: string;
    organizations: Organization[];
    startDate: Date;
    endDate: Date;
    eventType?: EventType;
    audit: Auditable;
}

export interface Auditable {
    createdDate: Date;
    createdBy: string;
    createdByDisplayName?: string;
    lastModifiedDate: Date;
    lastModifiedBy: string;
    lastModifiedByDisplayName?: string;
}

export enum SocketSubscriptionTopics {
    EVENT_CREATED = "/topic/newEvent/",
    EVENT_UPDATED = "/topic/updateEvent/",
    TASK_CREATED = "/topic/newEventTask/",
    TASK_COMMENT_CREATED = "/topic/newTaskComment/",
}

export const toTsrEvent = (eventDto: TsrEventDto): TsrEvent => ({
    ...eventDto,
    startDate: new Date(eventDto.startDate),
    endDate: new Date(eventDto.endDate),
});
