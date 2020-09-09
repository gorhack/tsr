import axios, { AxiosResponse } from "axios";
import { PageDTO, PageParams } from "../api";

const baseUri = "/api/v1/organization";

export const getOrganizationNames = async (
    pageParams: PageParams = {},
): Promise<PageDTO<Organization>> => {
    return axios
        .get(baseUri, { params: pageParams })
        .then((response: AxiosResponse<PageDTO<Organization>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export const saveOrganization = async (organizationName: string): Promise<Organization> => {
    try {
        return (await axios.post(baseUri, organizationName)).data;
    } catch (error) {
        throw new Error(error.response.message);
    }
};

export const getOrganizationContains = async (
    searchTerm: string,
): Promise<PageDTO<Organization>> => {
    return axios
        .get(`${baseUri}/search`, { params: { searchTerm } })
        .then((response: AxiosResponse<PageDTO<Organization>>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
};

export interface Organization {
    organizationId: number;
    organizationName: string;
    organizationDisplayName: string;
    sortOrder: number;
}
