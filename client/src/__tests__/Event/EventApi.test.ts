import axios from "axios";
import nock from "nock";
import {
    CreatableTsrEvent,
    getActiveEvents,
    getActiveEventsByOrganizationIds,
    getActiveEventsByUserId,
    saveEvent,
    TsrEvent,
    updateEvent,
} from "../../Event/EventApi";
import { makePage, NockBody } from "../TestHelpers";
import { HttpStatus, PageDTO } from "../../api";
import { Organization } from "../../Organization/OrganizationApi";

describe("event data", () => {
    const BASE_URL = "http://example.com";
    const START_DATE = "2020-08-18T14:15:59";
    const END_DATE = "2020-08-20T01:00:01";
    let userEvent: TsrEvent;
    let user2Event: TsrEvent;
    let eventsPage: PageDTO<unknown>;
    let organizations: Organization[];
    beforeEach(() => {
        organizations = [
            {
                organizationId: 1,
                organizationName: "organization",
                organizationDisplayName: "org name",
                sortOrder: 1,
            },
        ];
        userEvent = {
            eventId: 1,
            eventName: "first",
            organizations,
            eventType: {
                eventTypeId: 1,
                displayName: "run",
                eventTypeName: "and hide",
                sortOrder: 1,
            },
            startDate: START_DATE,
            endDate: END_DATE,
            audit: {
                createdBy: "1234",
                createdDate: START_DATE,
                lastModifiedBy: "6789",
                lastModifiedDate: START_DATE,
            },
        };
        user2Event = {
            eventId: 2,
            eventName: "second",
            organizations,
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
                createdDate: START_DATE,
                lastModifiedBy: "6789",
                lastModifiedDate: START_DATE,
            },
        };
        eventsPage = makePage({
            items: [userEvent, user2Event],
            first: true,
        });
    });

    axios.defaults.baseURL = BASE_URL;

    it("saves an event", async () => {
        const event: CreatableTsrEvent = {
            eventName: "first",
            organizations,
            eventType: {
                eventTypeId: 1,
                displayName: "run",
                eventTypeName: "and hide",
                sortOrder: 1,
            },
            startDate: START_DATE,
            endDate: END_DATE,
        };
        nock(BASE_URL)
            .post("/api/v1/event", event as NockBody)
            .reply(HttpStatus.CREATED, { eventId: 1, ...event });

        const response = await saveEvent(event);

        expect(response).toEqual({ eventId: 1, ...event });
    });

    it("updates an event", async () => {
        const event: TsrEvent = {
            eventId: 1,
            eventName: "first",
            organizations,
            eventType: {
                eventTypeId: 1,
                displayName: "run",
                eventTypeName: "and hide",
                sortOrder: 1,
            },
            startDate: START_DATE,
            endDate: END_DATE,
            audit: {
                createdBy: "1234",
                createdDate: START_DATE,
                lastModifiedBy: "6789",
                lastModifiedDate: START_DATE,
            },
        };
        nock(BASE_URL)
            .put("/api/v1/event", event as NockBody)
            .reply(HttpStatus.CREATED, { ...event });

        const response = await updateEvent(event);

        expect(response).toEqual(event);
    });

    describe("get active events", () => {
        it("gets page of events with default params", async () => {
            nock(BASE_URL).get("/api/v1/event/active").reply(200, eventsPage);

            const response = await getActiveEvents();

            expect(response).toEqual(eventsPage);
        });

        it("gets page of events events with page number as parameter", async () => {
            const events = {
                ...eventsPage,
                pageNumber: 1,
            };

            nock(BASE_URL).get("/api/v1/event/active?page=1").reply(200, events);

            const response = await getActiveEvents({ page: 1 });

            expect(response).toEqual(events);
        });

        it("gets page of events by user", async () => {
            nock(BASE_URL).get("/api/v1/event/active/user").reply(200, eventsPage);
            const response = await getActiveEventsByUserId();
            expect(response).toEqual(eventsPage);
        });

        it("gets page of events by user with page number as parameter", async () => {
            const events = {
                ...eventsPage,
                pageNumber: 1,
            };

            nock(BASE_URL).get("/api/v1/event/active/user?page=1").reply(200, events);
            const response = await getActiveEventsByUserId({ page: 1 });
            expect(response).toEqual(events);
        });

        it("gets page of events by organization ids", async () => {
            nock(BASE_URL).get("/api/v1/event/active/organizations").reply(200, eventsPage);
            const response = await getActiveEventsByOrganizationIds();
            expect(response).toEqual(eventsPage);
        });

        it("gets page of events by organizations with page number as parameter", async () => {
            const events = {
                ...eventsPage,
                pageNumber: 1,
            };

            nock(BASE_URL).get("/api/v1/event/active/organizations?page=1").reply(200, events);
            const response = await getActiveEventsByOrganizationIds({ page: 1 });
            expect(response).toEqual(events);
        });
    });
});
