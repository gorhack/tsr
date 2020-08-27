import axios from "axios";
import nock from "nock";
import { EventType, getEventTypes, saveEvent, TsrEvent } from "../../Events/EventApi";
import { NockBody } from "../TestHelpers";
import { HttpStatus } from "../../api";

describe("event data", () => {
    axios.defaults.baseURL = "http://example.com";

    it("saves an event", async () => {
        const event: TsrEvent = {
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
});
