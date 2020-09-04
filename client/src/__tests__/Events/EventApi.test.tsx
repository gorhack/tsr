import axios from "axios";
import nock from "nock";
import td from "testdouble";
import {
    EventType,
    getCurrentAndFutureEvents,
    getEventTypes,
    saveEvent,
    EditableTsrEvent,
    TsrEvent,
    getCurrentAndFutureEventsByUserId,
} from "../../Events/EventApi";
import { NockBody } from "../TestHelpers";
import * as Api from "../../api";
import { HttpStatus, PageDTO } from "../../api";

describe("event data", () => {
    let mockCurrentTimeLocal: typeof Api.currentTimeLocal;
    let userEvent: TsrEvent;
    let user2Event: TsrEvent;
    let eventsPage: PageDTO<TsrEvent>;
    beforeEach(() => {
        mockCurrentTimeLocal = td.replace(Api, "currentTimeLocal");
        td.when(mockCurrentTimeLocal()).thenReturn("1970-01-01T00:00:01-00:00");
        userEvent = {
            eventId: 1,
            eventName: "first",
            organization: "the one",
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
            organization: "the two",
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
            organization: "the one",
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

    it("gets event types", async () => {
        const eventTypes: EventType[] = [
            {
                eventTypeId: 1,
                eventTypeName: "first",
                displayName: "first name",
                sortOrder: 1,
            },
            {
                eventTypeId: 2,
                eventTypeName: "second",
                displayName: "second name",
                sortOrder: 2,
            },
        ];

        nock("http://example.com")
            .get("/api/v1/event/types")
            .reply(HttpStatus.OK, [
                {
                    eventTypeId: 1,
                    eventTypeName: "first",
                    displayName: "first name",
                    sortOrder: 1,
                },
                {
                    eventTypeId: 2,
                    eventTypeName: "second",
                    displayName: "second name",
                    sortOrder: 2,
                },
            ]);
        const response = await getEventTypes();
        expect(response).toEqual(eventTypes);
    });
    describe("getAllEvents", () => {
        it("fetches all events with default params", async () => {
            nock("http://example.com")
                .get("/api/v1/event?localDate=1970-01-01T00:00:01-00:00")
                .reply(200, eventsPage);

            const response = await getCurrentAndFutureEvents();

            expect(response).toEqual(eventsPage);
        });

        it("fetches all events with page number", async () => {
            const events = {
                ...eventsPage,
                pageNumber: 1,
            };

            nock("http://example.com")
                .get("/api/v1/event?page=1&localDate=1970-01-01T00:00:01-00:00")
                .reply(200, events);

            const response = await getCurrentAndFutureEvents({ page: 1 });

            expect(response).toEqual(events);
        });
    });

    it("fetches a page of a user's ongoing and future events with default parameters", async () => {
        nock("http://example.com")
            .get("/api/v1/event/user/1234?localDate=1970-01-01T00:00:01-00:00")
            .reply(200, eventsPage);
        const response = await getCurrentAndFutureEventsByUserId("1234");
        expect(response).toEqual(eventsPage);
    });
});
