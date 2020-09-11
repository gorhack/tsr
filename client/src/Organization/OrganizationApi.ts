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

export const createOrganization = async (organization: Organization): Promise<Organization> => {
    return axios
        .post(baseUri, organization)
        .then((response: AxiosResponse<Organization>) => {
            return response.data;
        })
        .catch((error) => {
            throw new Error(error.message);
        });
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
