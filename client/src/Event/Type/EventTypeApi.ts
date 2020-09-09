import axios, { AxiosResponse } from "axios";
import { PageDTO } from "../../api";

const baseUri = "/api/v1/event/type";

export const getEventTypes = async (): Promise<PageDTO<EventType>> => {
    return axios
        .get(baseUri)
        .then((response: AxiosResponse<PageDTO<EventType>>) => {
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
