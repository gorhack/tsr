import { act, render, RenderResult, screen } from "@testing-library/react";
import React from "react";
import td from "testdouble";
import { EventsSection } from "../../Events/EventsSection";
import { MemoryHistory } from "history";
import { TsrEvent } from "../../Events/EventApi";
import { makeAudit, makeEvent } from "../TestHelpers";
import * as EventApi from "../../Events/EventApi";
import { TsrUser } from "../../Users/UserApi";

describe("home page of the application", () => {
    let mockGetAllEvents: typeof EventApi.getAllEvents;
    beforeEach(() => {
        mockGetAllEvents = td.replace(EventApi, "getAllEvents");
    });

    afterEach(td.reset);

    it("lists all created events", async () => {
        const eventList: TsrEvent[] = [
            makeEvent({
                eventId: 1,
                eventName: "barracks party",
                audit: makeAudit({ createdBy: "1234" }),
            }),
            makeEvent({
                eventId: 2,
                eventName: "cq smash",
                audit: makeAudit({ createdBy: "1234" }),
            }),
        ];
        await renderEventsSection({ events: eventList });

        expect(screen.getByTestId("org-event-1")).toHaveTextContent("barracks party");
        expect(screen.getByTestId("org-event-2")).toHaveTextContent("cq smash");
    });

    it("lists events created by logged in user", async () => {
        const myEvents: TsrEvent[] = [
            makeEvent({
                eventId: 1,
                eventName: "my event",
                audit: makeAudit({ createdBy: "1234" }),
            }),
            makeEvent({
                eventId: 2,
                eventName: "my second event",
                audit: makeAudit({ createdBy: "1234" }),
            }),
        ];

        await renderEventsSection({
            events: myEvents,
            user: { userId: "1234", username: "user", role: "USER" },
        });

        expect(screen.getByTestId("user-event-1")).toHaveTextContent("my event");
        expect(screen.getByTestId("user-event-2")).toHaveTextContent("my second event");
    });

    interface RenderEventsSectionProps {
        events: TsrEvent[];
        user?: TsrUser;
        history?: MemoryHistory;
    }

    const renderEventsSection = async ({
        events = [],
        user = { userId: "", username: "", role: "USER" },
    }: RenderEventsSectionProps): Promise<RenderResult> => {
        const eventListPromise = Promise.resolve(events);
        td.when(mockGetAllEvents()).thenDo(() => Promise.resolve(eventListPromise));
        const result = render(<EventsSection user={user} />);
        await act(async () => {
            await eventListPromise;
        });
        return result;
    };
});
