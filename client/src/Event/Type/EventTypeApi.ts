import axios, { AxiosResponse } from "axios";

const baseUri = "/api/v1/event/type";

export const getEventTypes = async (): Promise<EventType[]> => {
    return axios
        .get(baseUri)
        .then((response: AxiosResponse<EventType[]>) => {
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
