import { act, render, RenderResult, screen } from "@testing-library/react";
import { Home } from "../Home";
import { createMemoryHistory, MemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import React from "react";
import td from "testdouble";
import { makeEvent } from "./TestHelpers";
import * as EventApi from "../Events/EventApi";
import * as UserApi from "../Users/UserApi";
import * as Api from "../api";
import { TsrUser } from "../Users/UserApi";
import { TsrEvent } from "../Events/EventApi";
import { PageDTO } from "../api";

describe("home page of the application", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;
    let mockGetAllEvents: typeof EventApi.getAllEvents;
    let mockCurrentTimeLocal: typeof Api.currentTimeLocal;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
        mockGetAllEvents = td.replace(EventApi, "getAllEvents");
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
        const allEventsPromise: Promise<PageDTO<TsrEvent>> = Promise.resolve({
            items: [makeEvent({ eventId: 1, eventName: "first event!" })],
            totalResults: 1,
            pageNumber: 0,
            last: true,
            first: true,
            pageSize: 10,
            totalPages: 1,
        });
        const userPromise: Promise<TsrUser> = Promise.resolve({
            username: "tsrUser1",
            userId: "123-123-123",
            role: "USER",
        });
        td.when(mockGetUserInfo()).thenDo(() => userPromise);
        td.when(mockGetAllEvents()).thenDo(() => Promise.resolve(allEventsPromise));
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
            await allEventsPromise;
            await userPromise;
        });
        return result;
    };
});
