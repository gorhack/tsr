import axios, { AxiosResponse } from "axios";
import { PageDTO, PageParams } from "../../api";

const baseUri = "/api/v1/event/type";

export const getEventTypes = async (pageParams: PageParams = {}): Promise<PageDTO<EventTypeInterface>> => {
    return axios
        .get(baseUri, { params: pageParams })
        .then((response: AxiosResponse<PageDTO<EventTypeInterface>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const createEventType = async (eventType: EventTypeInterface): Promise<EventTypeInterface> => {
    return axios
        .post(baseUri, eventType)
        .then((response: AxiosResponse<EventTypeInterface>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getEventTypeContains = async (searchTerm: string): Promise<PageDTO<EventTypeInterface>> => {
    return axios
        .get(`${baseUri}/search`, { params: { searchTerm } })
        .then((response: AxiosResponse<PageDTO<EventTypeInterface>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export interface EventTypeInterface {
    eventTypeId: number;
    eventTypeName: string;
    displayName: string;
    sortOrder: number;
}

export enum EventActionTypes {
    LOAD,
}

export type EventTypeCacheReducerAction = {
    type: EventActionTypes.LOAD;
    eventTypes: EventTypeInterface[];
};
