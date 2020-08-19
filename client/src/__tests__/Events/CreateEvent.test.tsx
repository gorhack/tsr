import "mutationobserver-shim";
import { render, fireEvent, RenderResult, screen, act } from "@testing-library/react";
import { CreateEvent } from "../../Events/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { fillInInputValueInForm } from "../TestHelpers";
import td from "testdouble";
import * as EventApi from "../../Events/EventApi";
import { TsrEvent } from "../../Events/EventApi";

describe("create an event", () => {
    let mockSaveEvent: typeof EventApi.saveEvent;
    beforeEach(() => {
        mockSaveEvent = td.replace(EventApi, "saveEvent");
    });

    afterEach(td.reset);

    it("displays all required event fields", () => {
        renderCreateEvent();

        expect(screen.getByText("create an event")).toBeInTheDocument();
        expect(screen.getByLabelText("input the event name")).toBeInTheDocument();
        expect(screen.getByLabelText("input your organization")).toBeInTheDocument();
        expect(screen.getByLabelText("select the start date")).toBeInTheDocument();
        expect(screen.getByLabelText("select the end date")).toBeInTheDocument();
        expect(screen.getByLabelText("select the event type")).toBeInTheDocument();
        expect(screen.getByText("create event")).toBeInTheDocument();
        expect(screen.getByText("cancel")).toBeInTheDocument();
    });

    it("cancel create event goes back to home page", () => {
        const history = createMemoryHistory();
        renderCreateEvent(history);
        screen.getByText("cancel").click();
        expect(history.location.pathname).toEqual("/");
    });

    it("submitting the form saves event and goes to /eventId", async () => {
        const history = createMemoryHistory();
        const tsrEvent = {
            eventName: "",
            organization: "org",
            startDate: "1234",
            endDate: "1234",
            eventType: undefined,
        };
        const saveEventPromise: Promise<TsrEvent> = Promise.resolve({ ...tsrEvent, eventId: 1 });
        const result = renderCreateEvent(history);
        fillInInputValueInForm(result, "input your organization", "org", false);
        fillInInputValueInForm(result, "select the start date", "1234", false);
        fillInInputValueInForm(result, "select the end date", "1234", false);
        td.when(mockSaveEvent(tsrEvent)).thenDo(() => saveEventPromise);

        fireEvent.submit(result.getByTitle("createEventForm"));
        await act(async () => {
            await saveEventPromise;
        });
        expect(history.location.pathname).toEqual("/1");
    });

    const renderCreateEvent = (history = createMemoryHistory()): RenderResult => {
        history.push("/createEvent");
        return render(
            <Router history={history}>
                <Route path="/createEvent">
                    <CreateEvent />
                </Route>
            </Router>,
        );
    };
});
