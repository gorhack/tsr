import "mutationobserver-shim";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateEvent } from "../../Event/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory, MemoryHistory } from "history";
import {
    fillInDatePicker,
    fillInInputValueInForm,
    getInputValue,
    makeEvent,
    makeEventType,
    makeOrganization,
    makePage,
    reRender,
} from "../TestHelpers";
import td from "testdouble";
import * as EventApi from "../../Event/EventApi";
import { TsrEvent } from "../../Event/EventApi";
import * as EventTypeApi from "../../Event/Type/EventTypeApi";
import * as OrganizationApi from "../../Organization/OrganizationApi";
import selectEvent from "react-select-event";
import * as Api from "../../api";
import { PageDTO } from "../../api";

describe("create an event", () => {
    const EVENT_NAME_LABEL = "event name";
    const EVENT_TYPE_LABEL = "event type";
    const ORGANIZATIONS_LABEL = "organizations";
    const START_DATE_LABEL = "start date";
    const END_DATE_LABEL = "end date";
    const TODAYS_DATE = "12/12/2020";

    let mockSaveEvent: typeof EventApi.saveEvent;
    let mockUpdateEvent: typeof EventApi.updateEvent;
    let mockGetEventTypeContains: typeof EventTypeApi.getEventTypeContains;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;
    let mockGetEventById: typeof EventApi.getEventById;
    let mockCurrentDate: typeof Api.currentDate;
    let mockDatePlusYears: typeof Api.datePlusYears;
    let mockTsrEventContains = td.function("mockTsrEventContains");
    beforeEach(() => {
        mockSaveEvent = td.replace(EventApi, "saveEvent");
        mockUpdateEvent = td.replace(EventApi, "updateEvent");
        mockGetEventTypeContains = td.replace(EventTypeApi, "getEventTypeContains");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
        mockGetEventById = td.replace(EventApi, "getEventById");
        mockCurrentDate = td.replace(Api, "currentDate");
        mockDatePlusYears = td.replace(Api, "datePlusYears");
    });

    afterEach(td.reset);

    it("shows back to events", async () => {
        const history = createMemoryHistory();
        await renderCreateEvent({ history });
        fireEvent.click(screen.getByText("< back to events"));
        expect(history.location.pathname).toEqual("/");
    });

    it("displays all required event fields", async () => {
        await renderCreateEvent({});

        expect(screen.getByText("create an event")).toBeInTheDocument();
        expect(screen.getByLabelText(EVENT_NAME_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(ORGANIZATIONS_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(START_DATE_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(END_DATE_LABEL)).toBeInTheDocument();
        expect(screen.getByText(EVENT_TYPE_LABEL)).toBeInTheDocument();
        expect(screen.getByText("submit")).toBeInTheDocument();
        expect(screen.getByText("cancel")).toBeInTheDocument();
    });

    it("cancel create event goes back to home page", async () => {
        const history = createMemoryHistory();
        await renderCreateEvent({ history });
        await act(async () => {
            screen.getByText("cancel").click();
        });
        expect(history.location.pathname).toEqual("/");
    });

    it("submitting the form saves event and goes to /eventId", async () => {
        const startDate = new Date(TODAYS_DATE).toJSON();
        const endDate = new Date(TODAYS_DATE).toJSON();

        const history = createMemoryHistory();
        const orgNames = [
            makeOrganization({
                organizationId: 2,
                sortOrder: 2,
                organizationDisplayName: "second",
            }),
            makeOrganization({
                organizationId: 3,
                organizationDisplayName: "third",
                sortOrder: 3,
            }),
        ];
        const eventTypes = [
            makeEventType({ eventTypeId: 1, sortOrder: 1, displayName: "first" }),
        ];
        const eventTypesPromise = Promise.resolve(makePage({ items: eventTypes }));

        const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));
        const result = await renderCreateEvent({ history, orgNamesPromise, eventTypesPromise });
        const tsrEvent = {
            eventName: "name",
            organizations: [
                makeOrganization({
                    organizationId: 2,
                    organizationDisplayName: "second",
                    sortOrder: 2,
                }),
                makeOrganization({
                    organizationId: 3,
                    organizationDisplayName: "third",
                    sortOrder: 3,
                }),
            ],
            startDate: startDate,
            endDate: endDate,
            eventType: [
                makeEventType({
                    eventTypeId: 1,
                    sortOrder: 1,
                    displayName: "first",
                    eventTypeName: "first",

                })
            ],
        };
        const saveEventPromise: Promise<TsrEvent> = Promise.resolve({
            eventId: 1,
            audit: {
                createdBy: "user",
                createdDate: "2020-08-18T14:15:59",
                lastModifiedBy: "user",
                lastModifiedDate: "2020-08-18T14:15:59",
            },
            ...tsrEvent,
        });

        fillInInputValueInForm(result, "name", EVENT_NAME_LABEL);
        await selectEvent.select(screen.getByLabelText(ORGANIZATIONS_LABEL), "second");
        await selectEvent.select(screen.getByLabelText(ORGANIZATIONS_LABEL), "third");
        await selectEvent.select(screen.getByLabelText(EVENT_TYPE_LABEL), "first");
        fillInDatePicker(result, START_DATE_LABEL, TODAYS_DATE);
        fillInDatePicker(result, END_DATE_LABEL, TODAYS_DATE);

        td.when(mockSaveEvent(tsrEvent)).thenDo(() => saveEventPromise);

        await submitEventForm();
        await act(async () => {
            await saveEventPromise;
        });
        expect(history.location.pathname).toEqual("/event/1");
    });
    //TODO(BONFIRE)
    it("event name limited to 255 characters", async () => {
        await renderCreateEvent;
        //TODO(...conintue? 03 actual test. It is similiar to org select but there are issues)
        const invalidString = "a".repeat(256);
        //like what is this when statement even doing, does it need a mock.function, mock.object, wtf?
        td.when(mockTsrEventContains(invalidString)).thenReturn(Error);
        //is this just saying expect to see an invalid string, to be null? why not error?
        expect(screen.queryByText(invalidString)).toBeNull();
        const validString = "a".repeat(255);
        //so this is the parameter that passes the test after first failing
        expect(screen.getByText(validString)).toBeInTheDocument();

    });

    describe("edit event", () => {
        const dateToInput = new Date("2020-10-18T00:00:01").toLocaleDateString();
        const setupGetEventByIdPromise = async (
            history: MemoryHistory = createMemoryHistory(),
        ): Promise<RenderResult> => {
            const eventType1 = makeEventType({
                eventTypeId: 1,
                displayName: "test type",
                sortOrder: 1,
            });
            const tsrEvent = makeEvent({
                eventId: 1,
                eventName: "name",
                organizations: [
                    makeOrganization({
                        organizationId: 2,
                        organizationDisplayName: "second",
                        sortOrder: 2,
                    }),
                ],
                startDate: new Date(dateToInput).toJSON(),
                endDate: new Date(dateToInput).toJSON(),
                eventType: eventType1,
            });
            const eventTypesPromise = Promise.resolve(makePage({ items: [eventType1] }));
            return renderCreateEvent({ history, event: tsrEvent, eventTypesPromise });
        };

        it("when passed an eventId create event pulls all event info and fills in default values", async () => {
            const result = await setupGetEventByIdPromise();
            expect(getInputValue(screen.getByLabelText(EVENT_NAME_LABEL))).toEqual("name");
            expect(getInputValue(screen.getByLabelText(START_DATE_LABEL))).toContain(dateToInput);
            expect(getInputValue(screen.getByLabelText(END_DATE_LABEL))).toContain(dateToInput);
            expect(result.container).toHaveTextContent(/.*second.*test type.*/);
        });

        it("cancel button when editing goes back to event details page and correct header", async () => {
            const history = createMemoryHistory();
            await setupGetEventByIdPromise(history);
            expect(history.location.pathname).toEqual(`/editEvent/1`);
            expect(screen.getByText("edit event")).toBeInTheDocument();
            await act(async () => {
                screen.getByText("cancel").click();
            });
            expect(history.location.pathname).toEqual(`/event/1`);
        });

        it("uses updateEvent function when submitting and leads back to /event/eventId", async () => {
            const history = createMemoryHistory();
            const tsrEvent = makeEvent({
                eventId: 1,
                eventName: "eman",
                organizations: [
                    makeOrganization({
                        organizationId: 2,
                        organizationDisplayName: "second",
                        sortOrder: 2,
                    }),
                ],
                startDate: new Date(dateToInput).toJSON(),
                endDate: new Date(dateToInput).toJSON(),
                eventType: makeEventType({
                    eventTypeId: 1,
                    displayName: "test type",
                    sortOrder: 1,
                })
            });
            const updateEventPromise: Promise<TsrEvent> = Promise.resolve(tsrEvent);
            const result = await setupGetEventByIdPromise(history);
            fillInInputValueInForm(result, "eman", EVENT_NAME_LABEL);

            td.when(mockUpdateEvent(tsrEvent)).thenDo(() => updateEventPromise);

            await submitEventForm();
            await act(async () => {
                await updateEventPromise;
            });
            expect(history.location.pathname).toEqual("/event/1");
        });
    });

    describe("handle errors", () => {
        it("requires event name", async () => {
            const errorMsg = "event name is required";
            await renderCreateEvent({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
        });

        it("requires event organization", async () => {
            const errorMsg = "Must select an organization.";
            const orgNames = [
                makeOrganization({
                    organizationId: 1,
                    sortOrder: 1,
                    organizationDisplayName: "2/75",
                }),
            ];
            const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));
            const result = await renderCreateEvent({ orgNamesPromise });
            expect(screen.queryByText(errorMsg)).toBeNull();

            fillInInputValueInForm(result, "name", EVENT_NAME_LABEL);
            fillInDatePicker(result, START_DATE_LABEL, TODAYS_DATE);
            fillInDatePicker(result, END_DATE_LABEL, TODAYS_DATE);

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            await act(async () => {
                await selectEvent.select(screen.getByLabelText(ORGANIZATIONS_LABEL), "2/75");
            });
            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires start date", async () => {
            const errorMsg = "start date is required MM/dd/YYYY";
            const result = await renderCreateEvent({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInDatePicker(result, START_DATE_LABEL, "no");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            userEvent.clear(result.getByRole("textbox", { name: START_DATE_LABEL }));

            fillInDatePicker(result, START_DATE_LABEL, TODAYS_DATE);
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires end date", async () => {
            const errorMsg = "end date after the start date is required MM/dd/YYYY";
            const result = await renderCreateEvent({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
            // react-date-picker will always try to make a valid date with a number input
            // TODO? make a test that makes sure end date will always be after start date
            fillInDatePicker(result, END_DATE_LABEL, "asdf");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            userEvent.clear(result.getByRole("textbox", { name: END_DATE_LABEL }));

            fillInDatePicker(result, END_DATE_LABEL, TODAYS_DATE);
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });
    });

    const submitEventForm = async () => {
        fireEvent.submit(screen.getByTitle("createEventForm"));
        await reRender();
    };

    interface RenderCreateEventProps {
        history?: MemoryHistory;
        eventTypesPromise?: Promise<PageDTO<unknown>>;
        orgNamesPromise?: Promise<PageDTO<unknown>>;
        event?: TsrEvent;
    }

    const renderCreateEvent = async ({
        history = createMemoryHistory(),
        eventTypesPromise = Promise.resolve(makePage()),
        orgNamesPromise = Promise.resolve(makePage()),
        event,
    }: RenderCreateEventProps): Promise<RenderResult> => {
        history.push(event ? `/editEvent/${event.eventId}` : "/createEvent");

        if (event) {
            td.when(mockGetEventById(td.matchers.anything())).thenResolve(event);
        }
        td.when(mockGetEventTypeContains("")).thenDo(() => Promise.resolve(eventTypesPromise));
        td.when(mockGetOrganizationContains("")).thenDo(() => Promise.resolve(orgNamesPromise));
        td.when(mockCurrentDate()).thenReturn(new Date(1607760000000)); // 12/12/2020
        td.when(mockDatePlusYears(10)).thenReturn(1923292800000); // 12/12/2030

        const path = event ? "/editEvent/:eventId" : "/createEvent";
        const result = render(
            <Router history={history}>
                <Route path={path}>
                    <CreateEvent />
                </Route>
            </Router>,
        );

        await act(async () => {
            await orgNamesPromise;
            await eventTypesPromise;
        });

        return result;
    };
});
