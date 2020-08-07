import axios from "axios";

export const getUserInfo = async (): Promise<TsrUser> => {
    const uri = "api/v1/user";
    const response = await axios.get(uri);
    return response.data;
};

export interface UserRoleUpdate {
    role: UserRole;
    userId: string;
}

export const saveUserRole = async (role: UserRole, userId: string): Promise<TsrUser> => {
    const userRoleUpdate: UserRoleUpdate = { role, userId };
    const uri = "api/v1/user/role";
    const result = await axios.post(uri, userRoleUpdate);
    return result.data;
};

export type UserRole = "ADMIN" | "USER";

export interface TsrUser {
    userId: string;
    username: string;
    role: UserRole;
}
