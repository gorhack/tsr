import "mutationobserver-shim";
import React from "react";
import { act, render, RenderResult, screen } from "@testing-library/react";
import td from "testdouble";
import * as UserApi from "../../Users/UserApi";
import { TsrUser } from "../../Users/UserApi";
import * as OrganizationApi from "../../Organization/OrganizationApi";
import { Organization } from "../../Organization/OrganizationApi";
import { UserSettings } from "../../Users/UserSettings";
import {
    fillInInputValueInForm,
    getInputValue,
    makeOrganization,
    makePage,
    reRender,
} from "../TestHelpers";
import { PageDTO } from "../../api";
import selectEvent from "react-select-event";
import { fireEvent } from "@testing-library/dom";

describe("User settings", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;
    let mockSetUserSettings: typeof UserApi.setUserSettings;
    let userWithoutSettings: TsrUser;
    let org1: Organization;
    let org2: Organization;
    let userWithSettings: TsrUser;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
        mockSetUserSettings = td.replace(UserApi, "setUserSettings");

        userWithoutSettings = {
            userId: "1234",
            username: "user",
            role: "USER",
            settings: { organizations: [] },
        };
        org1 = makeOrganization({
            organizationId: 1,
            organizationDisplayName: "org 1",
            sortOrder: 1,
        });
        org2 = makeOrganization({
            organizationId: 2,
            organizationDisplayName: "org 2",
            sortOrder: 2,
        });
        userWithSettings = {
            userId: "1234",
            username: "user",
            role: "USER",
            settings: {
                organizations: [org2, org1],
                phoneNumber: "1231231234",
                emailAddress: "test@example.com",
            },
        };
    });

    afterEach(td.reset);

    it("shows user name", async () => {
        const userPromise = Promise.resolve(userWithoutSettings);
        await renderUserSettings({ userPromise });
        const header = screen.getByText(`${userWithoutSettings.username} settings`);
        expect(header.tagName).toEqual("H1");
    });

    it("shows current user settings", async () => {
        const userPromise = Promise.resolve(userWithSettings);
        const result = await renderUserSettings({ userPromise });
        expect(result.container).toHaveTextContent(/.*org 2.*org 1.*/);
        expect(getInputValue(screen.getByLabelText("phone number"))).toEqual("1231231234");
        expect(getInputValue(screen.getByLabelText("email address"))).toEqual("test@example.com");
    });

    it("submit form with select org, find org, and save orgs", async () => {
        const userPromise = Promise.resolve(userWithoutSettings);
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
            userPromise,
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
                phoneNumber: undefined,
                emailAddress: undefined,
                organizations: expectedOrgs,
            }),
        ).thenResolve({
            userId: "1234",
            username: "updatedUser",
            role: "USER",
            settings: {
                organizations: expectedOrgs,
                emailAddress: undefined,
                phoneNumber: undefined,
            },
        });
        await submitSettingsForm();
        expect(screen.getByText("updatedUser settings")).toBeInTheDocument();
    });

    it("submits the form with user settings", async () => {
        const userPromise = Promise.resolve(userWithoutSettings);
        const organizationPromise = Promise.resolve(
            makePage({
                items: [org1, org2],
            }),
        ) as Promise<PageDTO<Organization>>;
        const result = await renderUserSettings({ userPromise, organizationPromise });
        await selectEvent.select(screen.getByLabelText("organizations"), ["org 1", "org 2"]);
        fillInInputValueInForm(result, "1231231234", "phone number");
        fillInInputValueInForm(result, "test@example.com", "email address");
        td.when(
            mockSetUserSettings({
                organizations: [org1, org2],
                phoneNumber: "1231231234",
                emailAddress: "test@example.com",
            }),
        ).thenResolve({
            userId: "1234",
            username: "updatedUser",
            role: "USER",
            settings: {
                organizations: [org1, org2],
                phoneNumber: "1231231234",
                emailAddress: "test@example.com",
            },
        });
        await submitSettingsForm();
        expect(screen.getByText("updatedUser settings")).toBeInTheDocument();
    });

    it("keeps orgs if not changed", async () => {
        const userPromise = Promise.resolve(userWithSettings);
        const result = await renderUserSettings({ userPromise });
        fillInInputValueInForm(result, "0980980987", "phone number");
        td.when(
            mockSetUserSettings({
                organizations: [org2, org1],
                phoneNumber: "0980980987",
                emailAddress: "test@example.com",
            }),
        ).thenResolve({
            userId: "1234",
            username: "updatedUser",
            role: "USER",
            settings: {
                organizations: [org2, org1],
                phoneNumber: "0980980987",
                emailAddress: "test@example.com",
            },
        });
        await submitSettingsForm();
        expect(screen.getByText("updatedUser settings")).toBeInTheDocument();
    });

    it("canceling resets settings to user values", async () => {
        const userPromise = Promise.resolve(userWithSettings);
        const result = await renderUserSettings({ userPromise });
        expect(result.container).toHaveTextContent(/.*org 2.*org 1.*/);
        expect(getInputValue(screen.getByLabelText("phone number"))).toEqual("1231231234");
        expect(getInputValue(screen.getByLabelText("email address"))).toEqual("test@example.com");

        await selectEvent.clearAll(screen.getByLabelText("organizations"));
        expect(result.container).not.toHaveTextContent(/.*org 2.*org 1.*/);
        fillInInputValueInForm(result, "something", "phone number");
        fillInInputValueInForm(result, "something", "email address");

        fireEvent.click(screen.getByRole("button", { name: "cancel" }));
        expect(result.container).toHaveTextContent(/.*org 2.*org 1.*/);
        expect(getInputValue(screen.getByLabelText("phone number"))).toEqual("1231231234");
        expect(getInputValue(screen.getByLabelText("email address"))).toEqual("test@example.com");
    });

    describe("form validation", () => {
        it("phone number max length 32 characters", async () => {
            const userPromise = Promise.resolve(userWithoutSettings);
            const result = await renderUserSettings({ userPromise });
            fillInInputValueInForm(result, "123456789012345678901234567890123", "phone number");
            await submitSettingsForm();
            expect(
                screen.getByText("phone number can be a maximum of 32 characters"),
            ).toBeInTheDocument();
        });
        it("email can have max length 254 characters", async () => {
            const userPromise = Promise.resolve(userWithoutSettings);
            const result = await renderUserSettings({ userPromise });
            const longEmail = "a".repeat(255);
            expect(longEmail.length).toEqual(255);
            fillInInputValueInForm(result, longEmail, "email address");
            await submitSettingsForm();
            expect(
                screen.getByText("email address can be a maximum of 254 characters"),
            ).toBeInTheDocument();
        });
    });

    interface RenderUserSettingsProps {
        userPromise: Promise<TsrUser>;
        organizationPromise?: Promise<PageDTO<Organization>>;
    }

    const renderUserSettings = async ({
        userPromise,
        organizationPromise = Promise.resolve(makePage() as PageDTO<Organization>),
    }: RenderUserSettingsProps): Promise<RenderResult> => {
        td.when(mockGetUserInfo()).thenDo(() => Promise.resolve(userPromise));
        td.when(mockGetOrganizationContains("")).thenDo(() => Promise.resolve(organizationPromise));
        const result = render(<UserSettings />);

        await act(async () => {
            await userPromise;
            await organizationPromise;
        });

        return result;
    };

    const submitSettingsForm = async () => {
        fireEvent.submit(screen.getByTitle("userSettingsForm"));
        await reRender();
    };
});