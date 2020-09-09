import axios, { AxiosResponse } from "axios";
import { PageDTO, PageParams } from "../api";
import { Organization } from "../Organization/OrganizationApi";
import { EventType } from "./Type/EventTypeApi";

const baseUri = "/api/v1/event";

export const saveEvent = async (event: EditableTsrEvent): Promise<TsrEvent> => {
    try {
        return (await axios.post(baseUri, event)).data;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getEventById = async (eventId: number): Promise<TsrEvent> => {
    const uri = `${baseUri}/${eventId}`;
    try {
        return (await axios.get(uri)).data;
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
    userId: string,
    pageParams: PageParams = {},
): Promise<PageDTO<TsrEvent>> => {
    const uri = `${baseUri}/active/user/${userId}`;
    return axios
        .get(uri, { params: pageParams })
        .then((response: AxiosResponse<PageDTO<TsrEvent>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

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
