import nock from "nock";
import { HttpStatus } from "../../../api";
import { EventType, getEventTypeContains, getEventTypes } from "../../../Event/Type/EventTypeApi";
import axios from "axios";
import { makePage } from "../../TestHelpers";

describe("event type", () => {
    axios.defaults.baseURL = "http://example.com";
    const firstEventType = {
        eventTypeId: 1,
        eventTypeName: "first",
        displayName: "first name",
        sortOrder: 1,
    };

    it("gets event types", async () => {
        const eventTypes: EventType[] = [
            firstEventType,
            {
                eventTypeId: 2,
                eventTypeName: "second",
                displayName: "second name",
                sortOrder: 2,
            },
        ];

        const eventTypePage = makePage({ items: eventTypes });

        nock("http://example.com").get("/api/v1/event/type").reply(HttpStatus.OK, eventTypePage);
        const response = await getEventTypes();
        expect(response).toEqual(eventTypePage);
    });

    it("gets event type with parameter", async () => {
        const eventTypePage = makePage({ items: [firstEventType], pageNumber: 2 });
        nock("http://example.com")
            .get("/api/v1/event/type?page=2")
            .reply(HttpStatus.OK, eventTypePage);
        const response = await getEventTypes({ page: 2 });
        expect(response).toEqual(eventTypePage);
    });

    it("gets event types that contain search term", async () => {
        const eventTypePage = makePage({ items: [firstEventType] });
        nock("http://example.com")
            .get("/api/v1/event/type/search?searchTerm=first")
            .reply(HttpStatus.OK, eventTypePage);
        const response = await getEventTypeContains("first");
        expect(response).toEqual(eventTypePage);
    });
});
