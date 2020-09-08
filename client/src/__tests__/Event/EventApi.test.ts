import axios from "axios";
import nock from "nock";
import td from "testdouble";
import {
    EditableTsrEvent,
    getCurrentAndFutureEvents,
    getCurrentAndFutureEventsByUserId,
    saveEvent,
    TsrEvent,
} from "../../Event/EventApi";
import { NockBody } from "../TestHelpers";
import * as Api from "../../api";
import { HttpStatus, PageDTO } from "../../api";
import { Organization } from "../../Organization/OrganizationApi";

describe("event data", () => {
    let mockCurrentTimeLocal: typeof Api.currentTimeLocal;
    let userEvent: TsrEvent;
    let user2Event: TsrEvent;
    let eventsPage: PageDTO<TsrEvent>;
    let organization: Organization;
    beforeEach(() => {
        mockCurrentTimeLocal = td.replace(Api, "currentTimeLocal");
        td.when(mockCurrentTimeLocal()).thenReturn("1970-01-01T00:00:01-00:00");
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

    describe("getAllEvents", () => {
        it("fetches all events with default params", async () => {
            nock("http://example.com").get("/api/v1/event").reply(200, eventsPage);

            const response = await getCurrentAndFutureEvents();

            expect(response).toEqual(eventsPage);
        });

        it("fetches all events with page number", async () => {
            const events = {
                ...eventsPage,
                pageNumber: 1,
            };

            nock("http://example.com").get("/api/v1/event?page=1").reply(200, events);

            const response = await getCurrentAndFutureEvents({ page: 1 });

            expect(response).toEqual(events);
        });
    });

    it("fetches a page of a user's ongoing and future events with default parameters", async () => {
        nock("http://example.com").get("/api/v1/event/user/1234").reply(200, eventsPage);
        const response = await getCurrentAndFutureEventsByUserId("1234");
        expect(response).toEqual(eventsPage);
    });
});
