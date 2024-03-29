import axios, { AxiosResponse } from "axios";
import { PageDTO } from "../../api";
import { TsrUser } from "../../Users/UserApi";
import { Auditable } from "../EventApi";

const baseUri = "/api/v1/event";

export const createEventTask = async (
    eventId: number,
    creatableEvent: EventTaskCategory,
): Promise<EventTask> => {
    const uri = `${baseUri}/${eventId}/task`;
    return axios
        .post(uri, creatableEvent)
        .then((response) => {
            return response.data as unknown as EventTask;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const createEventTaskCategory = async (
    eventTaskCategory: EventTaskCategory,
): Promise<EventTaskCategory> => {
    return axios
        .post(baseUri + "/task/category", eventTaskCategory)
        .then((response: AxiosResponse<EventTaskCategory>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const updateEventTaskSuspense = (
    eventId: number,
    taskId: number,
    updatedSuspenseDate: string,
): Promise<EventTask> => {
    const uri = `${baseUri}/${eventId}/task/${taskId}/suspense`;
    return axios
        .put(uri, { suspenseDate: updatedSuspenseDate })
        .then((response) => {
            return response.data as EventTask;
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

export const addComment = async (
    eventId: number,
    comment: EventTaskComment,
): Promise<EventTaskComment> => {
    const uri = `${baseUri}/${eventId}/task/${comment.eventTaskId}/comment`;
    return axios
        .post(uri, comment)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export interface EventTaskCategory {
    eventTaskCategoryId: number;
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

export interface EventTaskComment {
    commentId?: number;
    eventTaskId: number;
    annotation: string;
    audit?: Auditable;
}

export interface EventTask {
    eventTaskId: number;
    eventTaskCategory: EventTaskCategory;
    eventId: number;
    suspenseDate: string;
    approver: TsrUser;
    resourcer: TsrUser;
    status: EventTaskStatus;
    comments: EventTaskComment[];
}

export enum EventTaskActionTypes {
    LOAD,
    ADD,
    ADD_COMMENT,
}

export type EventTaskReducerAction =
    | { type: EventTaskActionTypes.LOAD; eventTasks: EventTask[] }
    | { type: EventTaskActionTypes.ADD; eventTask: EventTask }
    | { type: EventTaskActionTypes.ADD_COMMENT; comment: EventTaskComment };

export enum EventTaskCategoryActionTypes {
    LOAD,
}

export type EventTaskCategoryCacheReducerAction = {
    type: EventTaskCategoryActionTypes.LOAD;
    eventTaskCategories: EventTaskCategory[];
};
