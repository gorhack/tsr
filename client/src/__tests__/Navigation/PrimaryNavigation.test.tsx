import React from "react";
import td from "testdouble";
import * as UserApi from "../../Users/UserApi";
import { TsrUser } from "../../Users/UserApi";
import { act, render, RenderResult, screen } from "@testing-library/react";
import { PrimaryNavigation } from "../../Navigation/PrimaryNavigation";
import { UserContextProvider } from "../../Users/UserContext";

describe("Primary nav", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
    });

    afterEach(td.reset);

    it("Displays username", async () => {
        const userPromise: Promise<TsrUser> = Promise.resolve({
            userId: "1234",
            username: "cool user",
            role: "USER",
            settings: {
                organizations: [],
            },
        });
        await renderPrimaryNavigation(userPromise);

        expect(screen.getByText("cool user")).toBeInTheDocument();
    });

    const renderPrimaryNavigation = async (
        userPromise: Promise<TsrUser>,
    ): Promise<RenderResult> => {
        td.when(mockGetUserInfo()).thenDo(() => userPromise);
        const result = render(
            <UserContextProvider>
                <PrimaryNavigation />
            </UserContextProvider>,
        );
        await act(async () => {
            await userPromise;
        });
        return result;
    };
});
