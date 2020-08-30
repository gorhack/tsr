import { act, render, screen } from "@testing-library/react";
import { Home } from "../Home";
import { createMemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import React from "react";
import td from "testdouble";
import * as EventApi from "../Events/EventApi";
import { makeEvent } from "./TestHelpers";

describe("home page of the application", () => {
    let mockGetAllEvents: typeof EventApi.getAllEvents;
    const allEventsPromise = Promise.resolve([
        makeEvent({ eventId: 1, eventName: "first event!" }),
    ]);

    beforeEach(() => {
        mockGetAllEvents = td.replace(EventApi, "getAllEvents");
        td.when(mockGetAllEvents()).thenDo(() => Promise.resolve(allEventsPromise));
    });

    afterEach(td.reset);

    it("create an event button goes to create event page", async () => {
        const history = createMemoryHistory();
        history.push("/");
        render(
            <Router history={history}>
                <Route path="/">
                    <Home />
                </Route>
            </Router>,
        );
        await act(async () => {
            await allEventsPromise;
        });
        expect(screen.getByText("first event!")).toBeInTheDocument();
        screen.getByText("Create an Event").click();
        expect(history.location.pathname).toEqual("/createEvent");
    });
});
