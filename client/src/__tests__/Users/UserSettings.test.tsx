import "mutationobserver-shim";
import React from "react";
import { act, render, RenderResult, screen } from "@testing-library/react";
import td from "testdouble";
import * as UserApi from "../../Users/UserApi";
import { TsrUser } from "../../Users/UserApi";
import * as OrganizationApi from "../../Organization/OrganizationApi";
import { Organization } from "../../Organization/OrganizationApi";
import { UserSettings } from "../../Users/UserSettings";
import { makeOrganization, makePage, reRender } from "../TestHelpers";
import { PageDTO } from "../../api";
import selectEvent from "react-select-event";
import { fireEvent } from "@testing-library/dom";

describe("User settings", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;
    let mockSetUserSettings: typeof UserApi.setUserSettings;
    let userWithoutOrgs: TsrUser;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
        mockSetUserSettings = td.replace(UserApi, "setUserSettings");

        userWithoutOrgs = {
            userId: "1234",
            username: "user",
            role: "USER",
            organizations: [],
        };
        td.when(mockGetUserInfo()).thenResolve(userWithoutOrgs);
    });

    afterEach(td.reset);

    it("shows user name", async () => {
        await act(async () => {
            render(<UserSettings />);
        });
        const header = screen.getByText(`${userWithoutOrgs.username} settings`);
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

    it("submit form with select org, find org, and save orgs", async () => {
        const originalOrganizationPromise = Promise.resolve(
            makePage({
                items: [
                    makeOrganization({
                        organizationId: 1,
                        organizationDisplayName: "org 1",
                        sortOrder: 1,
                    }),
                    makeOrganization({
                        organizationId: 2,
                        organizationDisplayName: "org 2",
                        sortOrder: 2,
                    }),
                ],
            }),
        ) as Promise<PageDTO<Organization>>;
        const result = await renderUserSettings({
            organizationPromise: originalOrganizationPromise,
        });
        await selectEvent.select(screen.getByLabelText("organizations"), "org 2");
        td.when(mockGetOrganizationContains("fou")).thenResolve(
            makePage({
                items: [
                    makeOrganization({
                        organizationId: 4,
                        organizationDisplayName: "fourth",
                        sortOrder: 4,
                    }),
                ],
            }) as PageDTO<Organization>,
        );
        await act(async () => {
            fireEvent.change(screen.getByLabelText("organizations"), {
                target: { value: "fou" },
            });
        });
        await selectEvent.select(screen.getByLabelText("organizations"), "fourth");
        expect(result.container).toHaveTextContent(/.*org 2.*fourth.*/);
        const expectedOrgs = [
            makeOrganization({
                organizationId: 2,
                organizationDisplayName: "org 2",
                sortOrder: 2,
            }),
            makeOrganization({
                organizationId: 4,
                organizationDisplayName: "fourth",
                sortOrder: 4,
            }),
        ];
        td.when(
            mockSetUserSettings({
                organizations: expectedOrgs,
            }),
        ).thenResolve({
            userId: "1234",
            username: "updatedUser",
            role: "USER",
            organizations: expectedOrgs,
        });
        await submitSettingsForm();
        expect(screen.getByText("updatedUser settings")).toBeInTheDocument();
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

    const submitSettingsForm = async () => {
        fireEvent.submit(screen.getByTitle("userSettingsForm"));
        await reRender();
    };
});
