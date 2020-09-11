import React from "react";
import td from "testdouble";
import * as UserApi from "../Users/UserApi";
import { act, render, RenderResult, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PrimaryNavigation } from "../PrimaryNavigation";

describe("Primary nav", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
    });

    afterEach(td.reset);

    it("Displays username", async () => {
        td.when(mockGetUserInfo(), { times: 1 }).thenResolve({
            userId: "1234",
            username: "cool user",
            role: "USER",
        });
        await act(async () => {
            await renderPrimaryNavigation();
        });
        expect(screen.getByText("cool user")).toBeInTheDocument();
    });

    const renderPrimaryNavigation = async (): Promise<RenderResult> => {
        return render(
            <MemoryRouter>
                <PrimaryNavigation />
            </MemoryRouter>,
        );
    };
});
