import axios from "axios";

export const saveEvent = async (event: TsrEvent): Promise<TsrEvent> => {
    const uri = "api/v1/event";
    try {
        return (await axios.post(uri, event)).data;
    } catch (error) {
        console.error(error.message);
        throw new Error("bad things happened");
    }
};

export interface EventType {
    eventName: string;
    displayName: string;
    sortOrder: number;
}

export interface TsrEvent {
    eventId?: number;
    eventName?: string;
    organization: string;
    startDate: string;
    endDate: string;
    eventType?: EventType;
}