import axios from "axios";
import nock from "nock";
import { getUserInfo, saveUserRole, TsrUser, UserRoleUpdate } from "../../Users/UserApi";
import { NockBody } from "../TestHelpers";

describe("user info", () => {
    axios.defaults.baseURL = "http://example.com";

    it("gets logged in user", async () => {
        nock("http://example.com").get("/api/v1/user").reply(200, {
            user: "Regular User",
            username: "just_a_regular_user",
        });

        const response = await getUserInfo();

        expect(response).toEqual({ user: "Regular User", username: "just_a_regular_user" });
    });

    it("updates user role", async () => {
        const userChange: UserRoleUpdate = {
            userId: "123-123-123",
            role: "ADMIN",
        };

        nock("http://example.com")
            .put("/api/v1/user/role", userChange as NockBody)
            .reply(200, {
                ...userChange,
                username: "just_a_regular_user",
            } as TsrUser);
        const response = await saveUserRole("ADMIN", "123-123-123");
        expect(response).toEqual({
            userId: "123-123-123",
            username: "just_a_regular_user",
            role: "ADMIN",
        } as TsrUser);
    });
});
