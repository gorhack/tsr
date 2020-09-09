import nock from "nock";
import { HttpStatus } from "../../../api";
import { EventType, getEventTypes } from "../../../Event/Type/EventTypeApi";
import axios from "axios";
import { makePage } from "../../TestHelpers";

describe("event type", () => {
    axios.defaults.baseURL = "http://example.com";

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

        const eventTypePage = makePage({ items: eventTypes });

        nock("http://example.com").get("/api/v1/event/type").reply(HttpStatus.OK, eventTypePage);
        const response = await getEventTypes();
        expect(response).toEqual(eventTypePage);
    });
});
