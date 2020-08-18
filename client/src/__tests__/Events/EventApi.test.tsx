import axios from "axios";
import nock from "nock";
import { saveEvent, TsrEvent } from "../../Events/EventApi";
import { NockBody } from "../TestHelpers";
import { HttpStatus } from "../../api";

describe("event data", () => {
    axios.defaults.baseURL = "http://example.com";

    it("saves an event", async () => {
        const event: TsrEvent = {
            eventName: "first",
            organization: "the one",
            eventType: { displayName: "run", eventName: "and hide", sortOrder: 1 },
            startDate: "2020-08-18T14:15:59",
            endDate: "2020-08-20T01:00:01",
        };
        nock("http://example.com")
            .post("/api/v1/event", event as NockBody)
            .reply(HttpStatus.CREATED, { eventId: 1, ...event });

        const response = await saveEvent(event);

        expect(response).toEqual({ eventId: 1, ...event });
    });
});
