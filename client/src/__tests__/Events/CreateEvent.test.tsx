import "mutationobserver-shim";
import { render, fireEvent, RenderResult, screen, act } from "@testing-library/react";
import { CreateEvent } from "../../Events/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { fillInInputValueInForm, makeEventType, reRender } from "../TestHelpers";
import td from "testdouble";
import * as EventApi from "../../Events/EventApi";
import { EventType, TsrEvent } from "../../Events/EventApi";
import selectEvent from "react-select-event";

describe("create an event", () => {
    const dateToInput = new Date().toLocaleDateString();
    let mockSaveEvent: typeof EventApi.saveEvent;
    let mockGetEventTypes: typeof EventApi.getEventTypes;
    beforeEach(() => {
        mockSaveEvent = td.replace(EventApi, "saveEvent");
        mockGetEventTypes = td.replace(EventApi, "getEventTypes");
    });

    afterEach(td.reset);

    it("displays all required event fields", async () => {
        await renderCreateEvent();

        expect(screen.getByText("create an event")).toBeInTheDocument();
        expect(screen.getByLabelText("event name")).toBeInTheDocument();
        expect(screen.getByLabelText("organization")).toBeInTheDocument();
        expect(screen.getByLabelText("start date")).toBeInTheDocument();
        expect(screen.getByLabelText("end date")).toBeInTheDocument();
        expect(screen.getByText("event type")).toBeInTheDocument();
        expect(screen.getByText("submit")).toBeInTheDocument();
        expect(screen.getByText("cancel")).toBeInTheDocument();
    });

    it("cancel create event goes back to home page", async () => {
        const history = createMemoryHistory();
        await renderCreateEvent(history);
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
        const saveEventPromise: Promise<TsrEvent> = Promise.resolve({
            eventId: 1,
            createdBy: "user",
            createdDate: "2020-08-18T14:15:59",
            lastModifiedBy: "user",
            lastModifiedDate: "2020-08-18T14:15:59",
            ...tsrEvent,
        });
        const result = await renderCreateEvent(history);
        fillInInputValueInForm(result, "name", "event name");
        fillInInputValueInForm(result, "org", "organization");
        fillInInputValueInForm(result, dateToInput, undefined, "Choose the Start Date...", false);
        fillInInputValueInForm(result, dateToInput, undefined, "Choose the End Date...", false);

        td.when(mockSaveEvent(tsrEvent)).thenDo(() => saveEventPromise);

        await submitEventForm();
        await act(async () => {
            await saveEventPromise;
        });
        expect(history.location.pathname).toEqual("/event/1");
    });

    describe("event select", () => {
        const setupEventSelectPromise = async (): Promise<RenderResult> => {
            const eventTypes = [
                makeEventType({ eventTypeId: 3, sortOrder: 3, displayName: "third" }),
                makeEventType({ eventTypeId: 1, sortOrder: 1, displayName: "first" }),
                makeEventType({ eventTypeId: 2, sortOrder: 2, displayName: "second" }),
            ];
            const eventTypesPromise = Promise.resolve(eventTypes);
            return await renderCreateEvent(undefined, eventTypesPromise);
        };

        it("gets all the event types in order", async () => {
            await setupEventSelectPromise();
            await selectEvent.openMenu(screen.getByText("Select an Event..."));
            expect(screen.getByTestId("event-type-select")).toHaveTextContent(
                /first.*second.*third/,
            );
        });

        it("can clear the event types", async () => {
            await setupEventSelectPromise();
            await selectEvent.select(screen.getByText("Select an Event..."), "second");
            expect(screen.getByText("second")).toBeInTheDocument();
            await selectEvent.clearAll(screen.getByText("second"));
            expect(screen.queryByAltText("second")).toBeNull();
        });
    });

    describe("handle errors", () => {
        it("requires event name", async () => {
            const errorMsg = "event name is required";
            await renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
        });

        it("requires event organization", async () => {
            const errorMsg = "organization is required";
            const result = await renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "an org", "organization");
            await submitEventForm();
            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires start date", async () => {
            const errorMsg = "start date is required MM/dd/YYYY";
            const result = await renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "1234", undefined, "Choose the Start Date...");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(
                result,
                dateToInput,
                undefined,
                "Choose the Start Date...",
                false,
            );
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires end date after start date", async () => {
            const errorMsg = "end date after the start date is required MM/dd/YYYY";
            const result = await renderCreateEvent();
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "1234", undefined, "Choose the End Date...");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            const yesterday = new Date(dateToInput)
                .setDate(new Date(dateToInput).getDate() - 1)
                .toLocaleString();
            fillInInputValueInForm(result, yesterday, undefined, "Choose the End Date...");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, dateToInput, undefined, "Choose the End Date...", false);
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });
    });

    const submitEventForm = async () => {
        fireEvent.submit(screen.getByTitle("createEventForm"));
        await reRender();
    };

    const renderCreateEvent = async (
        history = createMemoryHistory(),
        eventTypesPromise: Promise<EventType[]> = Promise.resolve([]),
    ): Promise<RenderResult> => {
        history.push("/createEvent");

        td.when(mockGetEventTypes()).thenDo(() => Promise.resolve(eventTypesPromise));

        const result = render(
            <Router history={history}>
                <Route path="/createEvent">
                    <CreateEvent />
                </Route>
            </Router>,
        );

        await act(async () => {
            await eventTypesPromise;
        });

        return result;
    };
});
