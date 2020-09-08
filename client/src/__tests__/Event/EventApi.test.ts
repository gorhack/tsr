import axios from "axios";
import nock from "nock";
import {
    EditableTsrEvent,
    getActiveEvents,
    getActiveEventsByUserId,
    saveEvent,
    TsrEvent,
} from "../../Event/EventApi";
import { NockBody } from "../TestHelpers";
import { HttpStatus, PageDTO } from "../../api";
import { Organization } from "../../Organization/OrganizationApi";

describe("event data", () => {
    let userEvent: TsrEvent;
    let user2Event: TsrEvent;
    let eventsPage: PageDTO<TsrEvent>;
    let organization: Organization;
    beforeEach(() => {
        organization = {
            organizationId: 1,
            organizationName: "organization",
            organizationDisplayName: "org name",
            sortOrder: 1,
        };
        userEvent = {
            eventId: 1,
            eventName: "first",
            organization,
            eventType: {
                eventTypeId: 1,
                displayName: "run",
                eventTypeName: "and hide",
                sortOrder: 1,
            },
            startDate: "2020-08-18T14:15:59",
            endDate: "2020-08-20T01:00:01",
            audit: {
                createdBy: "1234",
                createdDate: "2020-08-18T14:15:59",
                lastModifiedBy: "6789",
                lastModifiedDate: "2020-08-18T14:15:59",
            },
        };
        user2Event = {
            eventId: 2,
            eventName: "second",
            organization,
            eventType: {
                eventTypeId: 2,
                displayName: "walk",
                eventTypeName: "and die",
                sortOrder: 2,
            },
            startDate: "2020-08-18T14:16:59",
            endDate: "2020-08-20T01:01:01",
            audit: {
                createdBy: "1234",
                createdDate: "2020-08-18T14:15:59",
                lastModifiedBy: "6789",
                lastModifiedDate: "2020-08-18T14:15:59",
            },
        };
        eventsPage = {
            items: [userEvent, user2Event],
            totalPages: 1,
            pageNumber: 0,
            pageSize: 10,
            totalResults: 2,
            first: true,
            last: false,
        };
    });

    axios.defaults.baseURL = "http://example.com";

    it("saves an event", async () => {
        const event: EditableTsrEvent = {
            eventName: "first",
            organization,
            eventType: {
                eventTypeId: 1,
                displayName: "run",
                eventTypeName: "and hide",
                sortOrder: 1,
            },
            startDate: "2020-08-18T14:15:59",
            endDate: "2020-08-20T01:00:01",
        };
        nock("http://example.com")
            .post("/api/v1/event", event as NockBody)
            .reply(HttpStatus.CREATED, { eventId: 1, ...event });

        const response = await saveEvent(event);

        expect(response).toEqual({ eventId: 1, ...event });
    });

    describe("get active events", () => {
        it("gets page of events with default params", async () => {
            nock("http://example.com").get("/api/v1/event/active").reply(200, eventsPage);

            const response = await getActiveEvents();

            expect(response).toEqual(eventsPage);
        });

        it("gets page of events events with page number as parameter", async () => {
            const events = {
                ...eventsPage,
                pageNumber: 1,
            };

            nock("http://example.com").get("/api/v1/event/active?page=1").reply(200, events);

            const response = await getActiveEvents({ page: 1 });

            expect(response).toEqual(events);
        });

        it("gets page of events by user", async () => {
            nock("http://example.com").get("/api/v1/event/active/user/1234").reply(200, eventsPage);
            const response = await getActiveEventsByUserId("1234");
            expect(response).toEqual(eventsPage);
        });

        it("gets page of events by user with page number as parameter", async () => {
            const events = {
                ...eventsPage,
                pageNumber: 1,
            };

            nock("http://example.com")
                .get("/api/v1/event/active/user/1234?page=1")
                .reply(200, events);
            const response = await getActiveEventsByUserId("1234", { page: 1 });
            expect(response).toEqual(events);
        });
    });
});
