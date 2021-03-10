import nock from "nock";
import { HttpStatus } from "../../../api";
import {
    createEventType,
    EventTypeInterface,
    getEventTypeContains,
    getEventTypes,
} from "../../../Event/Type/EventTypeApi";
import axios from "axios";
import { makePage } from "../../TestHelpers";

describe("event type", () => {
    const BASE_URL = "http://example.com";
    axios.defaults.baseURL = BASE_URL;
    const firstEventType = {
        eventTypeId: 1,
        eventTypeName: "first",
        displayName: "first name",
        sortOrder: 1,
    };

    it("gets event types", async () => {
        const eventTypes: EventTypeInterface[] = [
            firstEventType,
            {
                eventTypeId: 2,
                eventTypeName: "second",
                displayName: "second name",
                sortOrder: 2,
            },
        ];

        const eventTypePage = makePage({ items: eventTypes });

        nock(BASE_URL).get("/api/v1/event/type").reply(HttpStatus.OK, eventTypePage);
        const response = await getEventTypes();
        expect(response).toEqual(eventTypePage);
    });

    it("gets event type with parameter", async () => {
        const eventTypePage = makePage({ items: [firstEventType], pageNumber: 2 });
        nock(BASE_URL).get("/api/v1/event/type?page=2").reply(HttpStatus.OK, eventTypePage);
        const response = await getEventTypes({ page: 2 });
        expect(response).toEqual(eventTypePage);
    });

    it("gets event types that contain search term", async () => {
        const eventTypePage = makePage({ items: [firstEventType] });
        nock(BASE_URL)
            .get("/api/v1/event/type/search?searchTerm=fir")
            .reply(HttpStatus.OK, eventTypePage);
        const response = await getEventTypeContains("fir");
        expect(response).toEqual(eventTypePage);
    });

    it("creates an event type", async () => {
        const newEventType: EventTypeInterface = {
            eventTypeId: 1,
            eventTypeName: "one",
            displayName: "one",
            sortOrder: 1,
        };
        const eventToSave = {
            eventTypeId: 0,
            displayName: "one",
            eventTypeName: "one",
            sortOrder: 0,
        };
        nock(BASE_URL)
            .post("/api/v1/event/type", eventToSave)
            .reply(HttpStatus.CREATED, newEventType);
        const response = await createEventType(eventToSave);
        expect(response).toEqual(newEventType);
    });
});
