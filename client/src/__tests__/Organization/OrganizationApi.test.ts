import axios from "axios";
import nock from "nock";
import { HttpStatus } from "../../api";
import { getOrganizationNames } from "../../Organization/OrganizationApi";

describe("organization", () => {
    axios.defaults.baseURL = "http://example.com";

    it("gets all orgs", async () => {
        const organizations = [
            {
                organizationId: 1,
                organizationName: "first org",
                organizationDisplayName: "first name",
                sortOrder: 1,
            },
            {
                organizationId: 2,
                organizationName: "second org",
                organizationDisplayName: "second name",
                sortOrder: 2,
            },
        ];

        nock("http://example.com").get("/api/v1/organization").reply(HttpStatus.OK, organizations);
        const response = await getOrganizationNames();
        expect(response).toEqual(organizations);
    });
});
