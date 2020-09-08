import "mutationobserver-shim";
import { render, fireEvent, RenderResult, screen, act } from "@testing-library/react";
import { CreateEvent } from "../../Events/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory, MemoryHistory } from "history";
import { fillInInputValueInForm, makeEventType, makeOrganization, reRender } from "../TestHelpers";
import td from "testdouble";
import * as EventApi from "../../Events/EventApi";
import { EventType, Organization, TsrEvent } from "../../Events/EventApi";
import selectEvent from "react-select-event";

const selectDropdownOrderRegex = /first.*second.*third/;
const ORGANIZATION_PLACEHOLDER_TEXT = "Select Organizations...";
const EVENT_TYPE_PLACEHOLDER_TEXT = "Select an Event Type...";
const START_DATE_PLACEHOLDER_TEXT = "Choose the Start Date...";
const END_DATE_PLACEHOLDER_TEXT = "Choose the End Date...";

describe("create an event", () => {
    const dateToInput = new Date().toLocaleDateString();
    let mockSaveEvent: typeof EventApi.saveEvent;
    let mockGetEventTypes: typeof EventApi.getEventTypes;
    let mockGetOrgNames: typeof EventApi.getOrganizationNames;
    beforeEach(() => {
        mockSaveEvent = td.replace(EventApi, "saveEvent");
        mockGetEventTypes = td.replace(EventApi, "getEventTypes");
        mockGetOrgNames = td.replace(EventApi, "getOrganizationNames");
    });

    afterEach(td.reset);

    it("displays all required event fields", async () => {
        await renderCreateEvent({});

        expect(screen.getByText("create an event")).toBeInTheDocument();
        expect(screen.getByLabelText("event name")).toBeInTheDocument();
        expect(screen.getByText("organization name")).toBeInTheDocument();
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
        ];
        const orgNamesPromise = Promise.resolve(orgNames);
        const tsrEvent = {
            eventName: "name",
            organization: makeOrganization({
                organizationId: 2,
                organizationDisplayName: "second",
                sortOrder: 2,
            }),
            startDate: new Date(dateToInput).toJSON(),
            endDate: new Date(dateToInput).toJSON(),
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
        await selectEvent.select(screen.getByText(ORGANIZATION_PLACEHOLDER_TEXT), "second");
        fillInInputValueInForm(result, dateToInput, undefined, START_DATE_PLACEHOLDER_TEXT, false);
        fillInInputValueInForm(result, dateToInput, undefined, END_DATE_PLACEHOLDER_TEXT, false);

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
            return renderCreateEvent({ eventTypesPromise });
        };

        it("gets all the event types in order", async () => {
            await setupEventSelectPromise();
            await selectEvent.openMenu(screen.getByText(EVENT_TYPE_PLACEHOLDER_TEXT));
            expect(screen.getByTestId("event-type-select")).toHaveTextContent(
                selectDropdownOrderRegex,
            );
        });

        it("can clear the event types", async () => {
            await setupEventSelectPromise();
            await selectEvent.select(screen.getByText(EVENT_TYPE_PLACEHOLDER_TEXT), "second");
            expect(screen.getByText("second")).toBeInTheDocument();
            await selectEvent.clearAll(screen.getByText("second"));
            expect(screen.queryByAltText("second")).toBeNull();
        });
    });

    describe("org select", () => {
        const setupOrgSelectPromise = async (): Promise<RenderResult> => {
            const orgNames = [
                makeOrganization({
                    organizationId: 3,
                    sortOrder: 3,
                    organizationDisplayName: "third",
                }),
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
            ];
            const orgNamesPromise = Promise.resolve(orgNames);
            return renderCreateEvent({ orgNamesPromise });
        };

        it("gets all org names in order", async () => {
            await setupOrgSelectPromise();
            await selectEvent.openMenu(screen.getByText(ORGANIZATION_PLACEHOLDER_TEXT));
            expect(screen.getByTestId("org-name-select")).toHaveTextContent(
                selectDropdownOrderRegex,
            );
        });

        it("can clear the org name", async () => {
            await setupOrgSelectPromise();
            await selectEvent.select(screen.getByText(ORGANIZATION_PLACEHOLDER_TEXT), "second");
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
            const orgNamesPromise = Promise.resolve(orgNames);
            const result = await renderCreateEvent({ orgNamesPromise });
            expect(screen.queryByText(errorMsg)).toBeNull();

            fillInInputValueInForm(result, "name", "event name");
            fillInInputValueInForm(
                result,
                dateToInput,
                undefined,
                START_DATE_PLACEHOLDER_TEXT,
                false,
            );
            fillInInputValueInForm(
                result,
                dateToInput,
                undefined,
                END_DATE_PLACEHOLDER_TEXT,
                false,
            );

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            await act(async () => {
                await selectEvent.select(screen.getByText(ORGANIZATION_PLACEHOLDER_TEXT), "2/75");
            });
            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires start date", async () => {
            const errorMsg = "start date is required MM/dd/YYYY";
            const result = await renderCreateEvent({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "1234", undefined, START_DATE_PLACEHOLDER_TEXT);
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(
                result,
                dateToInput,
                undefined,
                START_DATE_PLACEHOLDER_TEXT,
                false,
            );
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires end date after start date", async () => {
            const errorMsg = "end date after the start date is required MM/dd/YYYY";
            const result = await renderCreateEvent({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(result, "1234", undefined, END_DATE_PLACEHOLDER_TEXT);
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            const yesterday = new Date(dateToInput)
                .setDate(new Date(dateToInput).getDate() - 1)
                .toLocaleString();
            fillInInputValueInForm(result, yesterday, undefined, END_DATE_PLACEHOLDER_TEXT);
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInInputValueInForm(
                result,
                dateToInput,
                undefined,
                END_DATE_PLACEHOLDER_TEXT,
                false,
            );
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
        eventTypesPromise?: Promise<EventType[]>;
        orgNamesPromise?: Promise<Organization[]>;
    }

    const renderCreateEvent = async ({
        history = createMemoryHistory(),
        eventTypesPromise = Promise.resolve([]),
        orgNamesPromise = Promise.resolve([]),
    }: RenderCreateEventProps): Promise<RenderResult> => {
        history.push("/createEvent");

        td.when(mockGetEventTypes()).thenDo(() => Promise.resolve(eventTypesPromise));
        td.when(mockGetOrgNames()).thenDo(() => Promise.resolve(orgNamesPromise));

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
