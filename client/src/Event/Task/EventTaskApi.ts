import axios, { AxiosResponse } from "axios";
import { PageDTO } from "../../api";
import { TsrUser } from "../../Users/UserApi";

const baseUri = "/api/v1/event/task";

export const createEventTask = async (creatableEvent: CreateEventTask): Promise<EventTask> => {
    return axios
        .post(baseUri, creatableEvent)
        .then((response: AxiosResponse<EventTask>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getEventTaskCategoriesContains = async (
    searchTerm: string,
): Promise<PageDTO<EventTaskCategory>> => {
    const uri = `${baseUri}/category/search`;
    return axios
        .get(uri, { params: { searchTerm } })
        .then((response: AxiosResponse<PageDTO<EventTaskCategory>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export interface EventTaskCategory {
    eventTaskId: number;
    eventTaskName: string;
    eventTaskDisplayName: string;
}

export enum StatusCode {
    R = "R",
    Y = "Y",
    G = "G",
}

export interface EventTaskStatus {
    statusId: number;
    statusName: string;
    statusDisplayName: string;
    statusShortName: StatusCode;
}

export interface CreateEventTask {
    eventTaskCategory: EventTaskCategory;
    eventId: number;
}

export interface EventTask {
    eventTaskCategory: EventTaskCategory;
    eventId: number;
    suspenseDate: string;
    approver: TsrUser;
    resourcer: TsrUser;
    status: EventTaskStatus;
}
