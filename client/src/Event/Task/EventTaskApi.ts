import axios, { AxiosResponse } from "axios";
import { PageDTO } from "../../api";

const baseUri = "/api/v1/event/task/category";

export const getEventTaskCategoriesContains = async (
    searchTerm: string,
): Promise<PageDTO<EventTaskCategory>> => {
    const uri = `${baseUri}/search`;
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
