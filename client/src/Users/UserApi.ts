import axios from "axios";
import { Organization } from "../Organization/OrganizationApi";

const baseUri = "api/v1/user";

export const getUserInfo = async (): Promise<TsrUser> => {
    const response = await axios.get(baseUri);
    return response.data;
};

export interface UserRoleUpdate {
    role: UserRole;
    userId: string;
}

export const saveUserRole = async (role: UserRole, userId: string): Promise<TsrUser> => {
    const userRoleUpdate: UserRoleUpdate = { role, userId };
    const uri = `${baseUri}/role`;
    const result = await axios.put(uri, userRoleUpdate);
    return result.data;
};

export const setUserSettings = async (userSettings: TsrUserSettings): Promise<TsrUser> => {
    const uri = `${baseUri}/settings`;
    return (await axios.put(uri, userSettings)).data;
};

export interface TsrUserSettings {
    organizations: Organization[];
}

export type UserRole = "ADMIN" | "USER";

export interface TsrUser {
    userId: string;
    username: string;
    role: UserRole;
    organizations: Organization[];
}
