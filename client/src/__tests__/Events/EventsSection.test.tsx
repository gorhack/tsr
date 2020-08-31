import { act, render } from "@testing-library/react";
import React from "react";
import td from "testdouble";
import { EventsSection } from "../../Events/EventsSection";
import { TsrEvent } from "../../Events/EventApi";
import { makeEvent } from "../TestHelpers";
import * as EventApi from "../../Events/EventApi";

describe("home page of the application", () => {
    let mockGetAllEvents: typeof EventApi.getAllEvents;
    beforeEach(() => {
        mockGetAllEvents = td.replace(EventApi, "getAllEvents");
    });

    afterEach(td.reset);

    it("lists all created events", async () => {
        const eventList: TsrEvent[] = [
            makeEvent({ eventId: 1, eventName: "barracks party" }),
            makeEvent({ eventId: 2, eventName: "cq smash" }),
        ];
        const eventListPromise = Promise.resolve(eventList);
        td.when(mockGetAllEvents()).thenDo(() => Promise.resolve(eventListPromise));
        const result = render(<EventsSection />);
        await act(async () => {
            await eventListPromise;
        });

        expect(result.getByText("barracks party")).toBeInTheDocument();
        expect(result.getByText("cq smash")).toBeInTheDocument();
    });
});
