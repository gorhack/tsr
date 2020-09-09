import axios, { AxiosResponse } from "axios";
import { PageDTO, PageParams } from "../../api";

const baseUri = "/api/v1/event/type";

export const getEventTypes = async (pageParams: PageParams = {}): Promise<PageDTO<EventType>> => {
    return axios
        .get(baseUri, { params: pageParams })
        .then((response: AxiosResponse<PageDTO<EventType>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getEventTypeContains = async (searchTerm: string): Promise<PageDTO<EventType>> => {
    return axios
        .get(`${baseUri}/search`, { params: { searchTerm } })
        .then((response: AxiosResponse<PageDTO<EventType>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export interface EventType {
    eventTypeId: number;
    eventTypeName: string;
    displayName: string;
    sortOrder: number;
}
