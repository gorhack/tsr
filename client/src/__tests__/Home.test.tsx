import { act, render, RenderResult, screen } from "@testing-library/react";
import td from "testdouble";
import { Home } from "../Home";
import { Route, Routes } from "react-router-dom";
import React from "react";
import {
    callSocketSubscriptionHandler,
    makeAudit,
    makeEvent,
    makeOrganization,
    mockSocketService,
} from "./TestHelpers";
import * as EventApi from "../Event/EventApi";
import { SocketSubscriptionTopics, TsrEvent } from "../Event/EventApi";
import * as UserApi from "../Users/UserApi";
import { TsrUser } from "../Users/UserApi";
import { PageDTO } from "../api";
import { StompSocketProvider } from "../StompSocketContext";
import { SocketService } from "../SocketService";
import { UserContextProvider } from "../Users/UserContext";
import { Router, useLocation } from "react-router";
import { createMemoryHistory, MemoryHistory } from "history";

describe("home page of the application", () => {
    let mockGetActiveEventsByUserId: typeof EventApi.getActiveEventsByUserId;
    let mockGetActiveEventsByOrganizationIds: typeof EventApi.getActiveEventsByOrganizationIds;
    let mockGetUserInfo: typeof UserApi.getUserInfo;

    beforeEach(() => {
        mockGetActiveEventsByUserId = td.replace(EventApi, "getActiveEventsByUserId");
        mockGetActiveEventsByOrganizationIds = td.replace(
            EventApi,
            "getActiveEventsByOrganizationIds",
        );
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
    });

    afterEach(td.reset);

    it("create an event button goes to create event page", async () => {
        const history = createMemoryHistory();
        await renderHomePage({ history });
        expect(screen.getByText("first event!")).toBeInTheDocument();
        screen.getByText("Create an Event").click();
        expect(history.location.pathname).toEqual("/createEvent");
    });

    it("shows an alert when a new event in your orgs is created by someone else", async () => {
        const fakeStompSocketService = mockSocketService();
        await renderHomePage({ fakeStompSocketService });

        const yourSocketEvent = makeEvent({
            eventId: 55,
            eventName: "socket guy",
            audit: makeAudit({ createdBy: "1234" }),
        });

        const socketEvent2 = makeEvent({
            eventId: 43,
            eventName: "another one",
        });

        window.alert = jest.fn();

        const subscriptionIdOrg1 = fakeStompSocketService.findSubscription(
            `${SocketSubscriptionTopics.EVENT_CREATED}1`,
        ).subscription.id;

        const subscriptionIdOrg2 = fakeStompSocketService.findSubscription(
            `${SocketSubscriptionTopics.EVENT_CREATED}2`,
        ).subscription.id;

        act(() => {
            callSocketSubscriptionHandler(
                fakeStompSocketService,
                `${SocketSubscriptionTopics.EVENT_CREATED}1`,
                subscriptionIdOrg1,
                yourSocketEvent,
            );
        });
        expect(window.alert).not.toBeCalledWith(
            "new event has been created in your organization\nsocket guy\nrefresh the page",
        );

        act(() => {
            callSocketSubscriptionHandler(
                fakeStompSocketService,
                `${SocketSubscriptionTopics.EVENT_CREATED}2`,
                subscriptionIdOrg2,
                socketEvent2,
            );
        });
        expect(window.alert).toBeCalledWith(
            "new event has been created in your organization\nanother one\nrefresh the page",
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
        const user: TsrUser = {
            userId: "1234",
            username: "a user",
            role: "USER",
            settings: {
                organizations: [
                    makeOrganization({
                        organizationId: 1,
                        sortOrder: 1,
                    }),
                    makeOrganization({
                        organizationId: 2,
                        sortOrder: 2,
                    }),
                ],
            },
        };
        const userPromise = Promise.resolve(user);
        td.when(mockGetUserInfo()).thenDo(() => userPromise);
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
        td.when(mockGetActiveEventsByOrganizationIds()).thenDo(() =>
            Promise.resolve(orgEventsPromise),
        );
        td.when(mockGetActiveEventsByUserId()).thenDo(() => userEventsPromise);

        const socketProps = {
            inputSocketService: fakeStompSocketService,
        };

        const result = render(
            <StompSocketProvider {...socketProps}>
                <UserContextProvider>
                    <Router navigator={history} location={"/"}>
                        <Home />
                    </Router>
                </UserContextProvider>
            </StompSocketProvider>,
        );
        await act(async () => {
            await userPromise;
            await userEventsPromise;
            await orgEventsPromise;
        });
        return result;
    };
});
