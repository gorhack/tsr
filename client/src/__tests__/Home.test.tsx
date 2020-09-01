import { act, render, RenderResult, screen } from "@testing-library/react";
import { Home } from "../Home";
import { createMemoryHistory, MemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import React from "react";
import td from "testdouble";
import { makeEvent } from "./TestHelpers";
import * as EventApi from "../Events/EventApi";
import * as UserApi from "../Users/UserApi";
import { TsrUser } from "../Users/UserApi";

describe("home page of the application", () => {
    let mockGetUserInfo: typeof UserApi.getUserInfo;
    let mockGetAllEvents: typeof EventApi.getAllEvents;

    beforeEach(() => {
        mockGetUserInfo = td.replace(UserApi, "getUserInfo");
        mockGetAllEvents = td.replace(EventApi, "getAllEvents");
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
        const allEventsPromise = Promise.resolve([
            makeEvent({ eventId: 1, eventName: "first event!" }),
        ]);
        const userPromise: Promise<TsrUser> = Promise.resolve({
            username: "tsrUser1",
            userId: "123-123-123",
            role: "USER",
        });
        td.when(mockGetUserInfo()).thenDo(() => userPromise);
        td.when(mockGetAllEvents()).thenDo(() => Promise.resolve(allEventsPromise));

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
