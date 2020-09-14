import React from "react";
import { render, screen, act } from "@testing-library/react";
import td from "testdouble";
import * as UserApi from "../../Users/UserApi";
import { UserSettings } from "../../Users/UserSettings";
import { TsrUser } from "../../Users/UserApi";

describe("User settings", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
    });

    afterEach(td.reset);

    it("shows user name", async () => {
        const user: TsrUser = {
            userId: "1234",
            username: "user",
            role: "USER",
            organizations: [],
        };
        td.when(mockGetUserInfo()).thenResolve(user);
        await act(async () => {
            render(<UserSettings />);
        });
        const header = screen.getByText(`${user.username} settings`);
        expect(header.tagName).toEqual("H1");
    });
});
