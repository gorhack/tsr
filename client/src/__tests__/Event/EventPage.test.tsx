import { render, RenderResult, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import React from "react";
import td from "testdouble";
import * as EventApi from "../../Event/EventApi";
import { TsrEvent } from "../../Event/EventApi";
import * as Api from "../../api";
import { PageDTO } from "../../api";
import { EventPage } from "../../Event/EventPage";
import { createMemoryHistory, MemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import {
    fillInInputValueInForm,
    findByAriaLabel,
    makeAudit,
    makeEvent,
    makeEventType,
    makeOrganization,
    makePage,
    reRender,
} from "../TestHelpers";
import * as EventTaskApi from "../../Event/Task/EventTaskApi";
import { EventTaskCategory } from "../../Event/Task/EventTaskApi";
import moment from "moment";
import selectEvent from "react-select-event";
import * as EventTypeApi from "../../Event/Type/EventTypeApi";
import * as OrganizationApi from "../../Organization/OrganizationApi";

describe("displays event details", () => {
    let mockGetEventById: typeof EventApi.getEventById;
    /*
        Front end displays LOCAL time. Tests use regex to match possible outputs based on developer location...
        UTCs: -12:00 to +14:00
     */
    let mockUserTimeZone: typeof Api.userTimeZone;
    let mockCurrentTime: typeof Api.currentTimeUtc;
    let mockGetEventTypeContains: typeof EventTypeApi.getEventTypeContains;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;
    let mockGetEventTaskCategories: typeof EventTaskApi.getEventTaskCategoriesContains;
    let mockGetEventTasks: typeof EventTaskApi.getEventTasks;
    let mockUpdateEvent: typeof EventApi.updateEvent;

    beforeEach(() => {
        mockGetEventById = td.replace(EventApi, "getEventById");
        mockUserTimeZone = td.replace(Api, "userTimeZone");
        mockCurrentTime = td.replace(Api, "currentTimeUtc");
        mockGetEventTypeContains = td.replace(EventTypeApi, "getEventTypeContains");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
        mockGetEventTaskCategories = td.replace(EventTaskApi, "getEventTaskCategoriesContains");
        mockGetEventTasks = td.replace(EventTaskApi, "getEventTasks");
        mockUpdateEvent = td.replace(EventApi, "updateEvent");
        td.when(mockGetEventTasks(td.matchers.anything())).thenResolve([]);
    });
    afterEach(td.reset);

    it("shows text to go back to events", async () => {
        const history = createMemoryHistory();
        await renderEventDetails({ history });
        expect(screen.getByRole("button", { name: "< back to events" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "< back to events" }));
        expect(history.location.pathname).toEqual("/");
    });

    describe("editing an event", () => {
        const dateToInput = new Date("2020-10-18T00:00:01").toLocaleDateString();
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

        it("displays correct event form header", async () => {
            await renderEventDetails({ event: tsrEvent });
            fireEvent.click(screen.getByRole("button", { name: "edit event" }));

            expect(screen.getByRole("heading", { name: "Edit Event" })).toBeVisible();
        });

        it("edit event button is present and switches to an editing state", async () => {
            await renderEventDetails({ event: tsrEvent });

            const editButton = screen.getByRole("button", { name: "edit event" });

            expect(editButton).toBeVisible();
            fireEvent.click(editButton);
            expect(screen.queryByRole("button", { name: "edit event" })).not.toBeInTheDocument();
        });

        it("can update an event and takes user back to details", async () => {
            const eventType2 = makeEventType({
                eventTypeId: 1,
                displayName: "new event type",
                sortOrder: 1,
            });
            const orgNames = [
                makeOrganization({
                    organizationId: 1,
                    sortOrder: 1,
                    organizationDisplayName: "first",
                }),
            ];
            const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));
            const eventTypesPromise = Promise.resolve(makePage({ items: [eventType2] }));

            const newEvent = { ...tsrEvent, eventName: "new name", eventType: eventType2 };

            td.when(mockUpdateEvent(newEvent)).thenResolve(newEvent);
            td.when(mockGetEventTypeContains("")).thenDo(() => Promise.resolve(eventTypesPromise));
            td.when(mockGetOrganizationContains("")).thenDo(() => Promise.resolve(orgNamesPromise));

            const result = await renderEventDetails({ event: tsrEvent });

            fireEvent.click(screen.getByRole("button", { name: "edit event" }));
            fillInInputValueInForm(result, "new name", "event name");
            await selectEvent.select(screen.getByLabelText("event type"), "new event type");
            fireEvent.click(screen.getByRole("button", { name: "submit" }));
            await reRender();
            expect(screen.getByRole("button", { name: /add tasks/i })).toBeVisible();
        });
    });

    describe("headers", () => {
        it("displays event details", async () => {
            const event: TsrEvent = {
                eventId: 4,
                eventName: "first event",
                eventType: {
                    eventTypeId: 2,
                    sortOrder: 1,
                    displayName: "big",
                    eventTypeName: "BIG_GUY",
                },
                startDate: "2020-08-18T14:15:59Z",
                endDate: "2020-08-20T01:00:01Z",
                organizations: [
                    makeOrganization({
                        organizationId: 1,
                        organizationName: "test_ragnar",
                        organizationDisplayName: "ragnar",
                        sortOrder: 1,
                    }),
                    makeOrganization({
                        organizationId: 2,
                        organizationName: "org2",
                        organizationDisplayName: "org2",
                        sortOrder: 2,
                    }),
                ],
                audit: {
                    createdBy: "1234",
                    createdByDisplayName: "test_user",
                    createdDate: "2020-07-18T06:15:59Z",
                    lastModifiedBy: "6789",
                    lastModifiedByDisplayName: "test_user_2",
                    lastModifiedDate: "2020-07-18T10:00:00Z",
                },
            };

            const result = await renderEventDetails({ event });
            const title = screen.getByText("first event details");
            expect(title.tagName).toEqual("H1");
            const subheading = screen.getByText(
                /(Tue|Wed) Aug (18|19), 2020 - (Thu|Fri) Aug (19|20), 2020/,
            );
            expect(subheading.tagName).toEqual("H2");
            expect(screen.getByText("Big")).toBeInTheDocument();
            expect(findByAriaLabel(result.container, "End Date")).toHaveTextContent(
                /^(Thursday|Wednesday), August (19th|20th) 2020, [0-9]{4} \(TIMEZONE\/timezone\)$/,
            );
            expect(findByAriaLabel(result.container, "Start Date")).toHaveTextContent(
                /^(Tuesday|Wednesday), August (18th|19th) 2020, [0-9]{4} \(TIMEZONE\/timezone\)$/,
            );
            expect(screen.getByText("ragnar; org2")).toBeInTheDocument();
            expect(screen.getByText(/test_user, \(7\/(17|18)\/20\)/)).toBeInTheDocument();
            expect(screen.getByText("test_user_2, 2 days ago")).toBeInTheDocument();
        });

        it("only one date if start and end date are the exact same", async () => {
            const event = makeEvent({
                eventId: 2,
                eventName: "another event",
                startDate: "2020-08-18T01:01:01",
                endDate: "2020-08-18T01:01:01",
            });
            const result = await renderEventDetails({ event });
            expect(screen.getByText(/(Mon|Tue) Aug (17|18), 2020/).tagName).toEqual("H2");
            expect(findByAriaLabel(result.container, "Date")).toHaveTextContent(
                /(Monday|Tuesday), August (17th|18th) 2020, [0-9]{4} \(TIMEZONE\/timezone\)/,
            );
        });
    });

    describe("last modified", () => {
        const LAST_MODIFIED_DATE = "2020-07-18T10:00:00";
        const LAST_MODIFIED_ARIA_LABEL = "Last Modified By";
        const makeEventWithLastModified = (lastModifiedDate: string): TsrEvent => {
            return makeEvent({
                eventId: 1,
                audit: makeAudit({
                    lastModifiedByDisplayName: "user",
                    lastModifiedDate,
                }),
            });
        };
        it("last modified in the last 5 minutes displays just now", async () => {
            const event = makeEventWithLastModified(LAST_MODIFIED_DATE);
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T10:05:59" });
            expect(findByAriaLabel(result.container, LAST_MODIFIED_ARIA_LABEL)).toHaveTextContent(
                "user, just now...",
            );
        });

        it("last modified displays minutes if minutes ago", async () => {
            const event = makeEventWithLastModified(LAST_MODIFIED_DATE);
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T10:06:00" });
            expect(findByAriaLabel(result.container, LAST_MODIFIED_ARIA_LABEL)).toHaveTextContent(
                "user, 6 minutes ago",
            );
        });

        it("last modified displays hour if 1 hour ago", async () => {
            const event = makeEventWithLastModified(LAST_MODIFIED_DATE);
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T11:59:59" });
            expect(findByAriaLabel(result.container, LAST_MODIFIED_ARIA_LABEL)).toHaveTextContent(
                "user, 1 hour ago",
            );
        });

        it("last modified displays hours if hours ago", async () => {
            const event = makeEventWithLastModified(LAST_MODIFIED_DATE);
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T12:00:00" });
            expect(findByAriaLabel(result.container, LAST_MODIFIED_ARIA_LABEL)).toHaveTextContent(
                "user, 2 hours ago",
            );
        });

        it("last modified displays day if 1 day ago", async () => {
            const event = makeEventWithLastModified("2020-07-17T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-19T09:59:59" });
            expect(findByAriaLabel(result.container, LAST_MODIFIED_ARIA_LABEL)).toHaveTextContent(
                "user, 1 day ago",
            );
        });

        it("last modified displays date if older than 1 week", async () => {
            const event = makeEventWithLastModified("2020-07-17T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-24T10:00:00" });
            expect(findByAriaLabel(result.container, LAST_MODIFIED_ARIA_LABEL)).toHaveTextContent(
                "user, 7/17/20",
            );
        });
    });

    describe("event tasks", () => {
        it("shows a react select that gets list of tasks", async () => {
            const result = await renderEventDetails({});
            expect(screen.getByRole("button", { name: "add tasks" })).toBeInTheDocument();
            selectEvent.openMenu(screen.getByLabelText("add tasks"));
            expect(result.container).toHaveTextContent(/.*task 1.*task 2.*/);
        });
    });

    interface RenderEventDetailsProps {
        event?: TsrEvent;
        currentTime?: string;
        history?: MemoryHistory;
    }

    const renderEventDetails = async ({
        event = makeEvent({ eventId: 1 }),
        currentTime = "2020-07-20T10:00:00",
        history = createMemoryHistory(),
    }: RenderEventDetailsProps): Promise<RenderResult> => {
        history.push(`/event/${event.eventId}`);
        td.when(mockGetEventById(event.eventId)).thenResolve(event);
        td.when(mockUserTimeZone()).thenReturn("TIMEZONE/timezone");
        td.when(mockCurrentTime()).thenReturn(moment(currentTime));
        td.when(mockGetEventTaskCategories(td.matchers.anything())).thenResolve(
            makePage({
                items: [
                    {
                        eventTaskId: 1,
                        eventTaskName: "task 1",
                        eventTaskDisplayName: "task 1",
                    },
                    {
                        eventTaskId: 2,
                        eventTaskName: "task 2",
                        eventTaskDisplayName: "task 2",
                    },
                ],
            }) as PageDTO<EventTaskCategory>,
        );

        const result = render(
            <Router history={history}>
                <Route path="/event/:eventId">
                    <EventPage />
                </Route>
            </Router>,
        );
        await reRender();
        return result;
    };
});
