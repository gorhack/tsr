import React, { ReactElement, useReducer, useState } from "react";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { makeOrganization, makePage } from "../TestHelpers";
import td from "testdouble";
import { Option, orgCacheReducer, PageDTO } from "../../api";
import * as OrganizationApi from "../../Organization/OrganizationApi";
import { Organization } from "../../Organization/OrganizationApi";
import selectEvent from "react-select-event";
import { OrgSelect } from "../../Organization/OrgSelect";
import { useForm } from "react-hook-form";

describe("org select", () => {
    const ORGANIZATIONS_LABEL = "organizations";

    let mockCreateOrganization: typeof OrganizationApi.createOrganization;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;

    beforeEach(() => {
        mockCreateOrganization = td.replace(OrganizationApi, "createOrganization");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
    });

    it("can create and select an organization", async () => {
        await setupOrgSelectPromise();
        td.when(mockGetOrganizationContains(td.matchers.anything())).thenResolve(
            makePage() as PageDTO<Organization>,
        );
        td.when(
            mockCreateOrganization({
                organizationId: 0,
                organizationDisplayName: "fourth",
                organizationName: "fourth",
                sortOrder: 0,
            }),
        ).thenResolve({
            organizationId: 4,
            organizationDisplayName: "fourth",
            organizationName: "fourth",
            sortOrder: 4,
        });
        await act(async () => {
            await selectEvent.create(screen.getByLabelText(ORGANIZATIONS_LABEL), "fourth");
        });
        expect(screen.getByText("fourth")).toBeInTheDocument();
    });

    it("can search for organizations", async () => {
        await setupOrgSelectPromise();

        td.when(mockGetOrganizationContains("fou")).thenResolve(
            makePage({
                items: [
                    makeOrganization({
                        organizationId: 4,
                        organizationDisplayName: "fourth",
                        organizationName: "fourth",
                        sortOrder: 4,
                    }),
                ],
            }) as PageDTO<Organization>,
        );
        await act(async () => {
            fireEvent.change(screen.getByLabelText(ORGANIZATIONS_LABEL), {
                target: { value: "fou" },
            });
        });
        await selectEvent.select(screen.getByLabelText(ORGANIZATIONS_LABEL), "fourth");
        expect(screen.getByText("fourth")).toBeInTheDocument();
    });

    it("can clear the org name", async () => {
        await setupOrgSelectPromise();
        await selectEvent.select(screen.getByLabelText(ORGANIZATIONS_LABEL), "second");
        expect(screen.getByText("second")).toBeInTheDocument();
        await selectEvent.clearAll(screen.getByText("second"));
        expect(screen.queryByAltText("second")).toBeNull();
    });

    it("org name limited to 255 characters", async () => {
        await setupOrgSelectPromise();

        const invalidString = "a".repeat(256);

        td.when(mockGetOrganizationContains(invalidString)).thenResolve(
            makePage() as PageDTO<Organization>,
        );

        await act(async () => {
            fireEvent.change(screen.getByLabelText(ORGANIZATIONS_LABEL), {
                target: { value: invalidString },
            });
        });
        expect(screen.queryByText(invalidString)).toBeNull();
        const validString = "a".repeat(255);
        expect(screen.getByText(validString)).toBeInTheDocument();
    });

    const setupOrgSelectPromise = async (): Promise<RenderResult> => {
        const orgNames = [
            makeOrganization({
                organizationId: 1,
                sortOrder: 1,
                organizationDisplayName: "first",
            }),
            makeOrganization({
                organizationId: 2,
                sortOrder: 2,
                organizationDisplayName: "second",
            }),
            makeOrganization({
                organizationId: 3,
                sortOrder: 3,
                organizationDisplayName: "third",
            }),
        ];
        const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));
        td.when(mockGetOrganizationContains("")).thenDo(() => Promise.resolve(orgNamesPromise));

        const result = render(<OrgSelectTestComponent />);

        await act(async () => {
            await orgNamesPromise;
        });
        return result;
    };
});

const OrgSelectTestComponent = (): ReactElement => {
    const { control } = useForm();
    const [orgValues, setOrgValues] = useState<Option[]>([]);
    return (
        <OrgSelect
            control={control}
            dispatchToOrgCache={useReducer(orgCacheReducer, [])[1]}
            selectedOrgs={orgValues}
            setSelectedOrgs={setOrgValues}
        />
    );
};
