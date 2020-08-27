import "mutationobserver-shim";
import { render, fireEvent, RenderResult, screen, act } from "@testing-library/react";
import { CreateEvent } from "../../Events/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { fillInInputValueInForm, reRender } from "../TestHelpers";
import td from "testdouble";
import * as EventApi from "../../Events/EventApi";
import { TsrEvent } from "../../Events/EventApi";

describe("create an event", () => {
    const dateToInput = new Date().toLocaleDateString();
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
            eventName: "name",
            organization: "org",
            startDate: new Date(dateToInput).toJSON(),
            endDate: new Date(dateToInput).toJSON(),
            eventType: undefined,
        };
        const saveEventPromise: Promise<TsrEvent> = Promise.resolve({ eventId: 1, ...tsrEvent });
        const result = renderCreateEvent(history);
        fillInInputValueInForm(result, "name", "input the event name");
        fillInInputValueInForm(result, "org", "input your organization");
        fillInInputValueInForm(result, dateToInput, undefined, "start date", false);
        fillInInputValueInForm(result, dateToInput, undefined, "end date", false);

        td.when(mockSaveEvent(tsrEvent)).thenDo(() => saveEventPromise);

        await submitEventForm();
        await act(async () => {
            await saveEventPromise;
        });
        expect(history.location.pathname).toEqual("/1");
    });

    describe("event select", () => {
        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("gets all the event types", () => {
            // TODO
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("can clear the event types", () => {
            // TODO
        });
    });

    describe("handle errors", () => {
        it("requires event name", async () => {
            const errorMsg = "event name is required";
            renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
        });

        it("requires event organization", async () => {
            const errorMsg = "organization is required";
            const result = renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "an org", "input your organization");
            await submitEventForm();
            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires start date", async () => {
            const errorMsg = "start date is required MM/dd/YYYY";
            const result = renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "1234", undefined, "start date");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, dateToInput, undefined, "start date", false);
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires end date after start date", async () => {
            const errorMsg = "end date after the start date is required MM/dd/YYYY";
            const result = renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "1234", undefined, "end date");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            const yesterday = new Date(dateToInput)
                .setDate(new Date(dateToInput).getDate() - 1)
                .toLocaleString();
            fillInInputValueInForm(result, yesterday, undefined, "end date");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, dateToInput, undefined, "end date", false);
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });
    });

    const submitEventForm = async () => {
        fireEvent.submit(screen.getByTitle("createEventForm"));
        await reRender();
    };

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
