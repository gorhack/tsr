import "mutationobserver-shim";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { CreateEvent } from "../../Event/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory, MemoryHistory } from "history";
import {
    fillInDatePicker,
    fillInInputValueInForm,
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

    it("has back to events button", async () => {
        const history = createMemoryHistory();
        await renderCreateEvent({ history });
        fireEvent.click(screen.getByText("< back to events"));
        expect(history.location.pathname).toEqual("/");
    });

    it("createEvent renders EventForm", async () => {
        await renderCreateEvent({});

        expect(screen.getByLabelText(EVENT_NAME_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(ORGANIZATIONS_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(START_DATE_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(END_DATE_LABEL)).toBeInTheDocument();
        expect(screen.getByLabelText(EVENT_TYPE_LABEL)).toBeInTheDocument();
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
    //TODO(BONFIRE)
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
        const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));
        const result = await renderCreateEvent({ history, orgNamesPromise });
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
            eventType: undefined,
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
        fillInDatePicker(result, START_DATE_LABEL, TODAYS_DATE);
        fillInDatePicker(result, END_DATE_LABEL, TODAYS_DATE);

        td.when(mockSaveEvent(tsrEvent)).thenDo(() => saveEventPromise);

        await submitEventForm();
        await act(async () => {
            await saveEventPromise;
        });
        expect(history.location.pathname).toEqual("/event/1");
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
            const orgNames = [
                makeOrganization({
                    organizationId: 1,
                    sortOrder: 1,
                    organizationDisplayName: "first",
                }),
            ];
            const tsrEvent = makeEvent({
                eventId: 1,
                eventName: "name",
                organizations: orgNames,
                startDate: new Date(dateToInput).toJSON(),
                endDate: new Date(dateToInput).toJSON(),
                eventType: eventType1,
            });
            const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));
            const eventTypesPromise = Promise.resolve(makePage({ items: [eventType1] }));
            return renderCreateEvent({
                history,
                event: tsrEvent,
                eventTypesPromise,
                orgNamesPromise,
            });
        };

        it("when passed an eventId create event calls getEventById", async () => {
            await setupGetEventByIdPromise();
            // console.warn as redundant assertion, however this is necessary because stubbing doesnt
            // verify a function is called unless you assert on the data which is unnecessary in this case
            // ex. comment out getEventId and all tests will still pass
            // TODO: This functionality will be getting refactored anyways
            td.verify(mockGetEventById(1));
        });

        it("uses updateEvent function when submitting an update and leads back to /event/eventId", async () => {
            const history = createMemoryHistory();
            const tsrEvent = makeEvent({
                eventId: 1,
                eventName: "eman",
                organizations: [
                    makeOrganization({
                        organizationId: 1,
                        organizationDisplayName: "first",
                        sortOrder: 1,
                    }),
                ],
                startDate: new Date(TODAYS_DATE).toJSON(),
                endDate: new Date(TODAYS_DATE).toJSON(),
                eventType: makeEventType({
                    eventTypeId: 1,
                    displayName: "test type",
                    sortOrder: 1,
                }),
            });
            const updateEventPromise: Promise<TsrEvent> = Promise.resolve(tsrEvent);
            const result = await setupGetEventByIdPromise(history);
            fillInInputValueInForm(result, "eman", EVENT_NAME_LABEL);
            await selectEvent.select(screen.getByLabelText(ORGANIZATIONS_LABEL), "first");
            await selectEvent.select(screen.getByLabelText(EVENT_TYPE_LABEL), "test type");
            fillInDatePicker(result, START_DATE_LABEL, TODAYS_DATE);
            fillInDatePicker(result, END_DATE_LABEL, TODAYS_DATE);

            td.when(mockUpdateEvent(tsrEvent)).thenDo(() => updateEventPromise);

            await submitEventForm();
            await act(async () => {
                await updateEventPromise;
            });
            expect(history.location.pathname).toEqual("/event/1");
        });
    });

    const submitEventForm = async () => {
        fireEvent.click(screen.getByRole("button", { name: /submit/i }));
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
