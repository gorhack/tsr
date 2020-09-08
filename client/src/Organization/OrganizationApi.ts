import axios, { AxiosResponse } from "axios";

const baseUri = "/api/v1/organization";

export const getOrganizationNames = async (): Promise<Organization[]> => {
    return axios
        .get(baseUri)
        .then((response: AxiosResponse<Organization[]>) => {
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

export interface Organization {
    organizationId: number;
    organizationName: string;
    organizationDisplayName: string;
    sortOrder: number;
}
