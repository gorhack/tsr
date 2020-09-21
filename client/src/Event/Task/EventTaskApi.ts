import axios, { AxiosResponse } from "axios";
import { PageDTO } from "../../api";
import { TsrUser } from "../../Users/UserApi";

const baseUri = "/api/v1/event";

export const createEventTask = async (
    eventId: number,
    creatableEvent: EventTaskCategory,
): Promise<EventTask> => {
    const uri = `${baseUri}/${eventId}/task`;
    return axios
        .post(uri, creatableEvent)
        .then((response: AxiosResponse<EventTask>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getEventTasks = async (eventId: number): Promise<EventTask[]> => {
    const uri = `${baseUri}/${eventId}/task`;
    return axios
        .get(uri)
        .then((response: AxiosResponse<EventTask[]>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const getEventTaskCategoriesContains = async (
    searchTerm: string,
): Promise<PageDTO<EventTaskCategory>> => {
    const uri = `${baseUri}/task/category/search`;
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
    sortOrder: number;
}

export interface EventTask {
    eventTaskCategory: EventTaskCategory;
    eventId: number;
    suspenseDate: string;
    approver: TsrUser;
    resourcer: TsrUser;
    status: EventTaskStatus;
}
