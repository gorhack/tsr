import axios from "axios";
import nock from "nock";
import { HttpStatus } from "../../api";
import {
    createOrganization,
    getOrganizationContains,
    getOrganizationNames,
} from "../../Organization/OrganizationApi";
import { makePage } from "../TestHelpers";

describe("organization", () => {
    axios.defaults.baseURL = "http://example.com";
    const organization1 = {
        organizationId: 1,
        organizationName: "first org",
        organizationDisplayName: "first name",
        sortOrder: 1,
    };

    it("gets all orgs", async () => {
        const organization2 = {
            organizationId: 2,
            organizationName: "second org",
            organizationDisplayName: "second name",
            sortOrder: 2,
        };
        nock("http://example.com")
            .get("/api/v1/organization")
            .reply(HttpStatus.OK, [organization1, organization2]);
        const response = await getOrganizationNames();
        expect(response).toEqual([organization1, organization2]);
    });

    it("gets organizations that contain search term", async () => {
        const organizationPage = makePage({ items: [organization1] });
        nock("http://example.com")
            .get("/api/v1/organization/search?searchTerm=seco")
            .reply(HttpStatus.OK, organizationPage);
        const response = await getOrganizationContains("seco");
        expect(response).toEqual(organizationPage);
    });

    it("creates and organization", async () => {
        nock("http://example.com")
            .post("/api/v1/organization", { displayName: "first org" })
            .reply(HttpStatus.CREATED, organization1);
        const response = await createOrganization("first org");
        expect(response).toEqual(organization1);
    });
});
