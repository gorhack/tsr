import "mutationobserver-shim";
import React from "react";
import { act, render, RenderResult, screen } from "@testing-library/react";
import td from "testdouble";
import * as UserApi from "../../Users/UserApi";
import { TsrUser } from "../../Users/UserApi";
import * as OrganizationApi from "../../Organization/OrganizationApi";
import { UserSettings } from "../../Users/UserSettings";
import { makeOrganization, makePage } from "../TestHelpers";
import { PageDTO } from "../../api";
import { Organization } from "../../Organization/OrganizationApi";

describe("User settings", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
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

    it("shows current user organizations", async () => {
        const user: TsrUser = {
            userId: "1234",
            username: "user",
            role: "USER",
            organizations: [
                makeOrganization({
                    organizationId: 2,
                    organizationDisplayName: "org 2",
                    sortOrder: 2,
                }),
                makeOrganization({
                    organizationId: 1,
                    organizationDisplayName: "org 1",
                    sortOrder: 1,
                }),
            ],
        };
        td.when(mockGetUserInfo()).thenResolve(user);
        const result = await renderUserSettings({});
        expect(result.container).toHaveTextContent(/.*org 2.*org 1.*/);
    });

    interface RenderUserSettingsProps {
        organizationPromise?: Promise<PageDTO<Organization>>;
    }

    const renderUserSettings = async ({
        organizationPromise = Promise.resolve(makePage() as PageDTO<Organization>),
    }: RenderUserSettingsProps): Promise<RenderResult> => {
        td.when(mockGetOrganizationContains("")).thenDo(() => Promise.resolve(organizationPromise));
        const result = render(<UserSettings />);
        await act(async () => {
            await organizationPromise;
        });
        return result;
    };
});
