import axios from "axios";

const baseUri = "/api/v1/event";

export const saveEvent = async (event: EditableTsrEvent): Promise<TsrEvent> => {
    try {
        return (await axios.post(baseUri, event)).data;
    } catch (error) {
        throw new Error(error.response.message);
    }
};

export const getEventById = async (eventId: number): Promise<TsrEvent> => {
    const uri = baseUri + `/${eventId}`;
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

export const getAllEvents = async (): Promise<TsrEvent[]> => {
    const uri = "/api/v1/event";
    try {
        const response = await axios.get(uri);
        return response.data;
    } catch (error) {
        throw new Error(error.response.message);
    }
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
    createdDate: string;
    createdBy: string;
    createdByDisplayName?: string;
    lastModifiedDate: string;
    lastModifiedBy: string;
    lastModifiedByDisplayName?: string;
}
