import { act, render, screen } from "@testing-library/react";
import * as React from "react";
import td from "testdouble";
import * as UserApi from "../../Users/UserApi";
import { User } from "../../Users/User";
import { TsrUser } from "../../Users/UserApi";

describe("Display user info", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
    });
    afterEach(td.reset);

    it("Calls getUserInfo on load", async () => {
        const userPromise: Promise<TsrUser> = Promise.resolve({
            username: "tsrUser1",
            userId: "123-123-123",
            role: "USER",
        });
        td.when(mockGetUserInfo()).thenDo(() => userPromise);
        await act(async () => {
            await render(<User />);
        });
        await userPromise;
        expect(screen.getByText("tsrUser1")).toBeInTheDocument();
        expect(screen.getByText("123-123-123")).toBeInTheDocument();
    });
});
