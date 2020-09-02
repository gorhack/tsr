import { act, render, RenderResult, screen, fireEvent } from "@testing-library/react";
import React from "react";
import td from "testdouble";
import { EventsSection } from "../../Events/EventsSection";
import { createMemoryHistory, MemoryHistory } from "history";
import { TsrEvent } from "../../Events/EventApi";
import { makeAudit, makeEvent } from "../TestHelpers";
import * as EventApi from "../../Events/EventApi";
import { TsrUser } from "../../Users/UserApi";
import { Route, Router } from "react-router-dom";
import { PageDTO } from "../../api";

describe("home page of the application", () => {
    let mockGetAllEvents: typeof EventApi.getAllEvents;
    let eventList: TsrEvent[];
    let userPage1: PageDTO<TsrEvent>;
    let userPage2: PageDTO<TsrEvent>;
    let orgPage1: PageDTO<TsrEvent>;
    let orgPage2: PageDTO<TsrEvent>;
    beforeEach(() => {
        mockGetAllEvents = td.replace(EventApi, "getAllEvents");
        eventList = [
            makeEvent({
                eventId: 1,
                eventName: "first event",
                audit: makeAudit({ createdBy: "1234" }),
            }),
            makeEvent({
                eventId: 2,
                eventName: "second event",
                audit: makeAudit({ createdBy: "1234" }),
            }),
        ];
        userPage1 = {
            items: [eventList[0]],
            pageNumber: 1,
            pageSize: 1,
            totalPages: 2,
            totalResults: eventList.length,
            first: true,
            last: false,
        };
        userPage2 = {
            items: [eventList[1]],
            pageNumber: 2,
            pageSize: 1,
            totalPages: 2,
            totalResults: eventList.length,
            first: false,
            last: true,
        };
        orgPage1 = { ...userPage1, items: [eventList[0]] };
        orgPage2 = { ...userPage2, items: [eventList[1]] };
    });

    afterEach(td.reset);

    it("lists all non-user org events", async () => {
        await renderEventsSection({ events: eventList });

        expect(screen.getByTestId("org-event-1")).toHaveTextContent("first event");
        expect(screen.getByTestId("org-event-2")).toHaveTextContent("second event");
    });

    it("shows load more if more org event pages", async () => {
        await renderEventsSection({
            events: eventList,
            page: orgPage1,
        });
        const loadMoreButton = screen.getByTestId("org-event-more");
        expect(screen.getByText("first event")).toBeInTheDocument();
        expect(screen.queryByText("second event")).toBeNull();

        expect(loadMoreButton).toHaveTextContent("load more");
        const moreEventsPromise: Promise<PageDTO<TsrEvent>> = Promise.resolve(orgPage2);
        td.when(mockGetAllEvents({ page: 2 })).thenDo(() => Promise.resolve(moreEventsPromise));
        fireEvent.click(loadMoreButton);
        await act(async () => {
            await moreEventsPromise;
        });

        expect(screen.getByText("first event")).toBeInTheDocument();
        expect(screen.getByText("second event")).toBeInTheDocument();
        expect(screen.queryByTestId("org-event-more")).toBeNull();
    });

    it("lists events created by logged in user", async () => {
        await renderEventsSection({
            events: eventList,
            user: { userId: "1234", username: "user", role: "USER" },
        });

        expect(screen.getByTestId("user-event-1")).toHaveTextContent("first event");
        expect(screen.getByTestId("user-event-2")).toHaveTextContent("second event");
    });

    it("shows next if more user event pages", async () => {
        await renderEventsSection({
            events: eventList,
            page: userPage1,
            user: { userId: "1234", username: "user", role: "USER" },
        });
        const nextButton = screen.getByTestId("user-event-more");
        expect(screen.getByText("first event")).toBeInTheDocument();
        expect(screen.queryByText("second event")).toBeNull();

        expect(nextButton).toHaveTextContent("load more");
        const moreEventsPromise: Promise<PageDTO<TsrEvent>> = Promise.resolve(userPage2);
        td.when(mockGetAllEvents({ page: 2 })).thenDo(() => Promise.resolve(moreEventsPromise));
        fireEvent.click(nextButton);
        await act(async () => {
            await moreEventsPromise;
        });

        expect(screen.queryByText("first event")).toBeInTheDocument();
        expect(screen.getByText("second event")).toBeInTheDocument();
        expect(screen.queryByTestId("user-event-more")).toBeNull();
    });

    it("clicking on an event goes to event details", async () => {
        const history = createMemoryHistory();
        await renderEventsSection({
            events: [makeEvent({ eventId: 1, eventName: "this event" })],
            history,
        });
        fireEvent.click(screen.getByText("this event"));
        expect(history.location.pathname).toEqual("/event/1");
    });

    interface RenderEventsSectionProps {
        events: TsrEvent[];
        user?: TsrUser;
        history?: MemoryHistory;
        page?: PageDTO<TsrEvent>;
    }

    const renderEventsSection = async ({
        events = [],
        user = { userId: "", username: "", role: "USER" },
        history = createMemoryHistory(),
        page = {
            items: events,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
            totalResults: events.length,
            first: true,
            last: true,
        },
    }: RenderEventsSectionProps): Promise<RenderResult> => {
        const eventListPromise = Promise.resolve(page);
        td.when(mockGetAllEvents()).thenDo(() => Promise.resolve(eventListPromise));
        history.push("/");
        const result = render(
            <Router history={history}>
                <Route path="/">
                    <EventsSection user={user} />
                </Route>
            </Router>,
        );
        await act(async () => {
            await eventListPromise;
        });
        return result;
    };
});
