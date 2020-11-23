import "mutationobserver-shim";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateEvent } from "../../Event/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory, MemoryHistory } from "history";
import {
    datePickerToday,
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
import { EventType } from "../../Event/Type/EventTypeApi";
import * as OrganizationApi from "../../Organization/OrganizationApi";
import { Organization } from "../../Organization/OrganizationApi";
import selectEvent from "react-select-event";
import { PageDTO } from "../../api";

describe("create an event", () => {
    let mockSaveEvent: typeof EventApi.saveEvent;
    let mockUpdateEvent: typeof EventApi.updateEvent;
    let mockCreateEventType: typeof EventTypeApi.createEventType;
    let mockGetEventTypeContains: typeof EventTypeApi.getEventTypeContains;
    let mockCreateOrganization: typeof OrganizationApi.createOrganization;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;
    let mockGetEventById: typeof EventApi.getEventById;
    beforeEach(() => {
        mockSaveEvent = td.replace(EventApi, "saveEvent");
        mockUpdateEvent = td.replace(EventApi, "updateEvent");
        mockCreateEventType = td.replace(EventTypeApi, "createEventType");
        mockGetEventTypeContains = td.replace(EventTypeApi, "getEventTypeContains");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
        mockCreateOrganization = td.replace(OrganizationApi, "createOrganization");
        mockGetEventById = td.replace(EventApi, "getEventById");
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
        expect(screen.getByLabelText("event name")).toBeInTheDocument();
        expect(screen.getByLabelText("organizations")).toBeInTheDocument();
        expect(screen.getByLabelText("start date")).toBeInTheDocument();
        expect(screen.getByLabelText("end date")).toBeInTheDocument();
        expect(screen.getByText("event type")).toBeInTheDocument();
        expect(screen.getByText("submit")).toBeInTheDocument();
        expect(screen.getByText("cancel")).toBeInTheDocument();
    });

    it("cancel create event goes back to home page", async () => {
        const history = createMemoryHistory();
        await renderCreateEvent({ history });
        screen.getByText("cancel").click();
        expect(history.location.pathname).toEqual("/");
    });

    it("submitting the form saves event and goes to /eventId", async () => {
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
            startDate: new Date().toLocaleDateString(),
            endDate: new Date().toLocaleDateString(),
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
        const result = await renderCreateEvent({ history, orgNamesPromise });
        fillInInputValueInForm(result, "name", "event name");
        await selectEvent.select(screen.getByLabelText("organizations"), "second");
        await selectEvent.select(screen.getByLabelText("organizations"), "third");
        datePickerToday(result, "start date");
        datePickerToday(result, "end date");

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
            expect(getInputValue(screen.getByLabelText("event name"))).toEqual("name");
            expect(getInputValue(screen.getByLabelText("start date"))).toContain(dateToInput);
            expect(getInputValue(screen.getByLabelText("end date"))).toContain(dateToInput);
            expect(result.container).toHaveTextContent(/.*second.*test type.*/);
        });

        it("cancel button when editing goes back to event details page and correct header", async () => {
            const history = createMemoryHistory();
            await setupGetEventByIdPromise(history);
            expect(history.location.pathname).toEqual(`/editEvent/1`);
            expect(screen.getByText("edit event")).toBeInTheDocument();
            screen.getByText("cancel").click();
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
                }),
            });
            const updateEventPromise: Promise<TsrEvent> = Promise.resolve(tsrEvent);
            const result = await setupGetEventByIdPromise(history);
            fillInInputValueInForm(result, "eman", "event name");

            td.when(mockUpdateEvent(tsrEvent)).thenDo(() => updateEventPromise);

            await submitEventForm();
            await act(async () => {
                await updateEventPromise;
            });
            expect(history.location.pathname).toEqual("/event/1");
        });
    });

    describe("event type select", () => {
        const setupEventSelectPromise = async (): Promise<RenderResult> => {
            const eventTypes = [
                makeEventType({ eventTypeId: 1, sortOrder: 1, displayName: "first" }),
                makeEventType({ eventTypeId: 2, sortOrder: 2, displayName: "second" }),
                makeEventType({ eventTypeId: 3, sortOrder: 3, displayName: "third" }),
            ];
            const eventTypesPromise = Promise.resolve(makePage({ items: eventTypes }));
            return renderCreateEvent({ eventTypesPromise });
        };

        it("can clear the event types", async () => {
            await setupEventSelectPromise();
            await selectEvent.select(screen.getByLabelText("event type"), "second");
            expect(screen.getByText("second")).toBeInTheDocument();
            await selectEvent.clearAll(screen.getByLabelText("event type"));
            expect(screen.queryByText("second")).toBeNull();
        });

        it("can create and select an event type", async () => {
            await setupEventSelectPromise();
            td.when(mockGetEventTypeContains(td.matchers.anything())).thenResolve(
                makePage() as PageDTO<EventType>,
            );
            td.when(
                mockCreateEventType({
                    eventTypeId: 0,
                    eventTypeName: "fourth",
                    displayName: "fourth",
                    sortOrder: 0,
                }),
            ).thenResolve({
                eventTypeId: 4,
                displayName: "fourth",
                eventTypeName: "fourth",
                sortOrder: 4,
            });
            await act(async () => {
                await selectEvent.create(screen.getByLabelText("event type"), "fourth", {
                    waitForElement: false,
                });
            });
            expect(screen.getByText("fourth")).toBeInTheDocument();
        });

        it("can search for event types", async () => {
            await setupEventSelectPromise();

            td.when(mockGetEventTypeContains("fou")).thenResolve(
                makePage({
                    items: [
                        makeEventType({
                            eventTypeId: 4,
                            eventTypeName: "fourth",
                            displayName: "fourth",
                            sortOrder: 4,
                        }),
                    ],
                }) as PageDTO<EventType>,
            );
            await act(async () => {
                fireEvent.change(screen.getByLabelText("event type"), { target: { value: "fou" } });
            });
            await selectEvent.select(screen.getByLabelText("event type"), "fourth");
            expect(screen.getByText("fourth")).toBeInTheDocument();
        });
    });

    describe("org select", () => {
        const setupOrgSelectPromise = async (): Promise<RenderResult> => {
            const orgNames = [
                makeOrganization({
                    organizationId: 1,
                    sortOrder: 1,
                    organizationDisplayName: "first",
                }),
                makeOrganization({
                    organizationId: 2,
                    sortOrder: 2,
                    organizationDisplayName: "second",
                }),
                makeOrganization({
                    organizationId: 3,
                    sortOrder: 3,
                    organizationDisplayName: "third",
                }),
            ];
            const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));
            return renderCreateEvent({ orgNamesPromise });
        };

        it("can create and select an organization", async () => {
            await setupOrgSelectPromise();
            td.when(mockGetOrganizationContains(td.matchers.anything())).thenResolve(
                makePage() as PageDTO<Organization>,
            );
            td.when(
                mockCreateOrganization({
                    organizationId: 0,
                    organizationDisplayName: "fourth",
                    organizationName: "fourth",
                    sortOrder: 0,
                }),
            ).thenResolve({
                organizationId: 4,
                organizationDisplayName: "fourth",
                organizationName: "fourth",
                sortOrder: 4,
            });
            await act(async () => {
                await selectEvent.create(screen.getByLabelText("organizations"), "fourth", {
                    waitForElement: false,
                });
            });
            expect(screen.getByText("fourth")).toBeInTheDocument();
        });

        it("can search for organizations", async () => {
            await setupOrgSelectPromise();

            td.when(mockGetOrganizationContains("fou")).thenResolve(
                makePage({
                    items: [
                        makeOrganization({
                            organizationId: 4,
                            organizationDisplayName: "fourth",
                            organizationName: "fourth",
                            sortOrder: 4,
                        }),
                    ],
                }) as PageDTO<Organization>,
            );
            await act(async () => {
                fireEvent.change(screen.getByLabelText("organizations"), {
                    target: { value: "fou" },
                });
            });
            await selectEvent.select(screen.getByLabelText("organizations"), "fourth");
            expect(screen.getByText("fourth")).toBeInTheDocument();
        });

        it("can clear the org name", async () => {
            await setupOrgSelectPromise();
            await selectEvent.select(screen.getByLabelText("organizations"), "second");
            expect(screen.getByText("second")).toBeInTheDocument();
            await selectEvent.clearAll(screen.getByText("second"));
            expect(screen.queryByAltText("second")).toBeNull();
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

            fillInInputValueInForm(result, "name", "event name");
            datePickerToday(result, "start date");
            datePickerToday(result, "end date");

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            await act(async () => {
                await selectEvent.select(screen.getByLabelText("organizations"), "2/75");
            });
            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires start date", async () => {
            const errorMsg = "start date is required MM/dd/YYYY";
            const result = await renderCreateEvent({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            userEvent.type(result.getByRole("textbox", { name: "start date" }), "asdf");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            datePickerToday(result, "start date");
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires end date after start date", async () => {
            const errorMsg = "end date after the start date is required MM/dd/YYYY";
            const result = await renderCreateEvent({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            userEvent.type(result.getByRole("textbox", { name: "end date" }), "asdf");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            datePickerToday(result, "end date");
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
