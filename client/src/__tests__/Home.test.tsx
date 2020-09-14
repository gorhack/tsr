import { act, render, RenderResult, screen } from "@testing-library/react";
import td from "testdouble";
import { Home } from "../Home";
import { createMemoryHistory, MemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import React from "react";
import {
    callSocketSubscriptionHandler,
    makeAudit,
    makeEvent,
    mockSocketService,
} from "./TestHelpers";
import * as EventApi from "../Event/EventApi";
import { SocketSubscriptionTopics, TsrEvent } from "../Event/EventApi";
import { PageDTO } from "../api";
import { StompSocketProvider } from "../StompSocketContext";
import { SocketService } from "../SocketService";

describe("home page of the application", () => {
    let mockGetCurrentAndFutureEvents: typeof EventApi.getActiveEvents;
    let mockGetCurrentAndFutureEventsByUserId: typeof EventApi.getActiveEventsByUserId;

    beforeEach(() => {
        mockGetCurrentAndFutureEvents = td.replace(EventApi, "getActiveEvents");
        mockGetCurrentAndFutureEventsByUserId = td.replace(EventApi, "getActiveEventsByUserId");
    });

    afterEach(td.reset);

    it("create an event button goes to create event page", async () => {
        const history = createMemoryHistory();
        await renderHomePage({ history });
        expect(screen.getByText("first event!")).toBeInTheDocument();
        screen.getByText("Create an Event").click();
        expect(history.location.pathname).toEqual("/createEvent");
    });

    it("shows an alert when a new user org event is created", async () => {
        // TODO use the user's org...
        const fakeStompSocketService = mockSocketService();
        await renderHomePage({ fakeStompSocketService });

        const socketEvent = makeEvent({
            eventId: 55,
            eventName: "socket guy",
        });

        window.alert = jest.fn();

        const subscriptionId = fakeStompSocketService.findSubscription(
            `${SocketSubscriptionTopics.EVENT_CREATED}-1`,
        ).subscription.id;

        act(() => {
            callSocketSubscriptionHandler(
                fakeStompSocketService,
                `${SocketSubscriptionTopics.EVENT_CREATED}-1`,
                subscriptionId,
                socketEvent,
            );
        });
        expect(window.alert).toBeCalledWith(
            "new event has been created in your organization\nsocket guy\nrefresh the page",
        );
    });

    interface RenderHomePageProps {
        history?: MemoryHistory;
        fakeStompSocketService?: SocketService;
    }

    const renderHomePage = async ({
        history = createMemoryHistory(),
        fakeStompSocketService = mockSocketService(),
    }: RenderHomePageProps): Promise<RenderResult> => {
        const userPage: PageDTO<TsrEvent> = {
            items: [
                makeEvent({
                    eventId: 1,
                    eventName: "first event!",
                    audit: makeAudit({ createdBy: "123-123-123" }),
                }),
            ],
            totalResults: 1,
            pageNumber: 0,
            last: true,
            first: true,
            pageSize: 10,
            totalPages: 1,
        };
        const userEventsPromise: Promise<PageDTO<TsrEvent>> = Promise.resolve(userPage);
        const orgEventsPromise: Promise<PageDTO<TsrEvent>> = Promise.resolve({
            ...userPage,
            items: [makeEvent({ eventId: 2, eventName: "another org event" })],
        });
        td.when(mockGetCurrentAndFutureEvents()).thenDo(() => Promise.resolve(orgEventsPromise));
        td.when(mockGetCurrentAndFutureEventsByUserId()).thenDo(() =>
            Promise.resolve(userEventsPromise),
        );

        history.push("/");
        const socketProps = {
            inputSocketService: fakeStompSocketService,
        };
        const result = render(
            <StompSocketProvider {...socketProps}>
                <Router history={history}>
                    <Route path="/">
                        <Home />
                    </Route>
                </Router>
            </StompSocketProvider>,
        );
        await act(async () => {
            await userEventsPromise;
            await orgEventsPromise;
        });
        return result;
    };
});
