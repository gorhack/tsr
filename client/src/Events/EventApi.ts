import axios, { AxiosResponse } from "axios";
import { currentTimeLocal, PageDTO, PageParams } from "../api";

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
        localDate: currentTimeLocal(),
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
        localDate: currentTimeLocal(),
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

export interface EventType {
    eventTypeId: number;
    eventTypeName: string;
    displayName: string;
    sortOrder: number;
}

export interface EditableTsrEvent {
    eventId?: number;
    eventName: string;
    organization: string;
    startDate: string;
    endDate: string;
    eventType?: EventType;
}

export interface TsrEvent {
    eventId: number;
    eventName: string;
    organization: string;
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
