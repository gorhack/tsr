import axios, { AxiosResponse } from "axios";
import { PageDTO, PageParams } from "../api";

const baseUri = "/api/v1/event";

export const saveEvent = async (event: EditableTsrEvent): Promise<TsrEvent> => {
    try {
        return (await axios.post(baseUri, event)).data;
    } catch (error) {
        throw new Error(error.response.message);
    }
};

export const getEventById = async (eventId: number): Promise<TsrEvent> => {
    const uri = `${baseUri}/${eventId}`;
    try {
        return (await axios.get(uri)).data;
    } catch (error) {
        throw new Error(error.response.message);
    }
};

export const getOrganizationNames = async (): Promise<Organization[]> => {
    const uri = baseUri + "/organizations";
    try {
        return (await axios.get(uri)).data;
    } catch (error) {
        throw new Error(error.response.message);
    }
};

export const getEventTypes = async (): Promise<EventType[]> => {
    const uri = baseUri + "/types";
    try {
        return (await axios.get(uri)).data;
    } catch (error) {
        throw new Error(error.response.message);
    }
};

export const getCurrentAndFutureEvents = async (
    pageParams: PageParams = {},
): Promise<PageDTO<TsrEvent>> => {
    const paramsWithDate = {
        ...pageParams,
    };
    try {
        return (await axios.get(baseUri, { params: paramsWithDate })).data;
    } catch (error) {
        throw new Error(error.response.message);
    }
};

export const getCurrentAndFutureEventsByUserId = async (
    userId: string,
    pageParams: PageParams = {},
): Promise<PageDTO<TsrEvent>> => {
    const uri = `${baseUri}/user/${userId}`;
    const paramsWithDate = {
        ...pageParams,
    };
    return await axios
        .get(uri, { params: paramsWithDate })
        .then((response: AxiosResponse<PageDTO<TsrEvent>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.response.message);
        });
};

export interface Organization {
    organizationId: number;
    organizationName: string;
    organizationDisplayName: string;
    sortOrder: number;
}

export interface EventType {
    eventTypeId: number;
    eventTypeName: string;
    displayName: string;
    sortOrder: number;
}

export interface EditableTsrEvent {
    eventId?: number;
    eventName: string;
    organization: Organization;
    startDate: string;
    endDate: string;
    eventType?: EventType;
}

export interface TsrEvent {
    eventId: number;
    eventName: string;
    organization: Organization;
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
