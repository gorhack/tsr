import axios from "axios";
import nock from "nock";
import {
    getUserInfo,
    saveUserRole,
    setUserSettings,
    TsrUser,
    UserRoleUpdate,
} from "../../Users/UserApi";
import { NockBody } from "../TestHelpers";
import { HttpStatus } from "../../api";
import { Organization } from "../../Organization/OrganizationApi";

describe("user info", () => {
    const BASE_URL = "http://example.com";
    const USER_ID = "123-123-123";
    const EMAIL_ADDRESS = "test@example.com";
    axios.defaults.baseURL = BASE_URL;

    it("gets logged in user", async () => {
        nock(BASE_URL).get("/api/v1/user").reply(HttpStatus.OK, {
            user: "Regular User",
            username: "just_a_regular_user",
        });

        const response = await getUserInfo();

        expect(response).toEqual({ user: "Regular User", username: "just_a_regular_user" });
    });

    it("updates user role", async () => {
        const userChange: UserRoleUpdate = {
            userId: USER_ID,
            role: "ADMIN",
        };

        nock(BASE_URL)
            .put("/api/v1/user/role", userChange as NockBody)
            .reply(HttpStatus.OK, {
                ...userChange,
                username: "just_a_regular_user",
            } as TsrUser);
        const response = await saveUserRole("ADMIN", USER_ID);
        expect(response).toEqual({
            userId: USER_ID,
            username: "just_a_regular_user",
            role: "ADMIN",
        } as TsrUser);
    });

    it("sets user settings", async () => {
        const organizations: Organization[] = [
            {
                organizationId: 1,
                organizationName: "org1",
                organizationDisplayName: "org 1",
                sortOrder: 1,
            },
            {
                organizationId: 2,
                organizationName: "org2",
                organizationDisplayName: "org 2",
                sortOrder: 2,
            },
        ];

        nock(BASE_URL)
            .put(
                "/api/v1/user/settings",
                JSON.stringify({
                    organizations: organizations,
                    phoneNumber: "1234",
                    emailAddress: EMAIL_ADDRESS,
                }),
            )
            .reply(HttpStatus.OK, {
                userId: 1,
                username: "user",
                role: "USER",
                organizations: organizations,
                phoneNumber: "1234",
                emailAddress: EMAIL_ADDRESS,
            });

        const response = await setUserSettings({
            organizations,
            phoneNumber: "1234",
            emailAddress: EMAIL_ADDRESS,
        });

        expect(response).toEqual({
            userId: 1,
            username: "user",
            role: "USER",
            organizations: organizations,
            phoneNumber: "1234",
            emailAddress: EMAIL_ADDRESS,
        });
    });
});
