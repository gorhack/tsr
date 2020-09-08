import { act, render, RenderResult, screen } from "@testing-library/react";
import td from "testdouble";
import { Home } from "../Home";
import { createMemoryHistory, MemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import React from "react";
import { makeAudit, makeEvent } from "./TestHelpers";
import * as EventApi from "../Event/EventApi";
import * as UserApi from "../Users/UserApi";
import * as Api from "../api";
import { TsrUser } from "../Users/UserApi";
import { TsrEvent } from "../Event/EventApi";
import { PageDTO } from "../api";

describe("home page of the application", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;
    let mockGetCurrentAndFutureEvents: typeof EventApi.getCurrentAndFutureEvents;
    let mockGetCurrentAndFutureEventsByUserId: typeof EventApi.getCurrentAndFutureEventsByUserId;
    let mockCurrentTimeLocal: typeof Api.currentTimeLocal;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
        mockGetCurrentAndFutureEvents = td.replace(EventApi, "getCurrentAndFutureEvents");
        mockGetCurrentAndFutureEventsByUserId = td.replace(
            EventApi,
            "getCurrentAndFutureEventsByUserId",
        );
        mockCurrentTimeLocal = td.replace(Api, "currentTimeLocal");
    });

    afterEach(td.reset);
    it("Calls getUserInfo on load", async () => {
        await renderHomePage();
        expect(screen.getByText("tsrUser1")).toBeInTheDocument();
        expect(screen.getByText("123-123-123")).toBeInTheDocument();
    });

    it("create an event button goes to create event page", async () => {
        const history = createMemoryHistory();
        await renderHomePage(history);
        expect(screen.getByText("first event!")).toBeInTheDocument();
        screen.getByText("Create an Event").click();
        expect(history.location.pathname).toEqual("/createEvent");
    });

    const renderHomePage = async (
        history: MemoryHistory = createMemoryHistory(),
    ): Promise<RenderResult> => {
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
        const userPromise: Promise<TsrUser> = Promise.resolve({
            username: "tsrUser1",
            userId: "123-123-123",
            role: "USER",
        });
        td.when(mockGetUserInfo()).thenDo(() => Promise.resolve(userPromise));
        td.when(mockGetCurrentAndFutureEvents()).thenDo(() => Promise.resolve(orgEventsPromise));
        td.when(mockGetCurrentAndFutureEventsByUserId("123-123-123")).thenDo(() =>
            Promise.resolve(userEventsPromise),
        );
        td.when(mockCurrentTimeLocal()).thenReturn("1970-01-01T00:00:01-00:00");

        history.push("/");
        const result = render(
            <Router history={history}>
                <Route path="/">
                    <Home />
                </Route>
            </Router>,
        );
        await act(async () => {
            await userPromise;
            await userEventsPromise;
            await orgEventsPromise;
        });
        return result;
    };
});
