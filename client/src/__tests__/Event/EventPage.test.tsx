import { render, RenderResult, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import React from "react";
import td from "testdouble";
import * as EventApi from "../../Event/EventApi";
import { TsrEvent } from "../../Event/EventApi";
import * as Api from "../../api";
import { EventPage } from "../../Event/EventPage";
import { createMemoryHistory, MemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import {
    findByAriaLabel,
    makeAudit,
    makeEvent,
    makeOrganization,
    makePage,
    reRender,
} from "../TestHelpers";
import * as EventTaskApi from "../../Event/Task/EventTaskApi";
import moment from "moment";
import { EventTaskCategory } from "../../Event/Task/EventTaskApi";
import { PageDTO } from "../../api";
import selectEvent from "react-select-event";

describe("displays event details", () => {
    let mockGetEventById: typeof EventApi.getEventById;
    /*
        Front end displays LOCAL time. Tests use regex to match possible outputs based on developer location...
        UTCs: -12:00 to +14:00
     */
    let mockUserTimeZone: typeof Api.userTimeZone;
    let mockCurrentTime: typeof Api.currentTimeUtc;
    let mockGetEventTaskCategories: typeof EventTaskApi.getEventTaskCategoriesContains;
    let mockGetEventTasks: typeof EventTaskApi.getEventTasks;

    beforeEach(() => {
        mockGetEventById = td.replace(EventApi, "getEventById");
        mockUserTimeZone = td.replace(Api, "userTimeZone");
        mockCurrentTime = td.replace(Api, "currentTimeUtc");
        mockGetEventTaskCategories = td.replace(EventTaskApi, "getEventTaskCategoriesContains");
        mockGetEventTasks = td.replace(EventTaskApi, "getEventTasks");
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

    it("edit event button is present pushes you to /editEvent", async () => {
        const history = createMemoryHistory();
        await renderEventDetails({ history });
        expect(screen.getByRole("button", { name: "edit event" })).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "edit event" }));
        expect(history.location.pathname).toEqual("/editEvent/1");
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
            const event = makeEventWithLastModified("2020-07-18T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T10:05:59" });
            expect(findByAriaLabel(result.container, "Last Modified By")).toHaveTextContent(
                "user, just now...",
            );
        });

        it("last modified displays minutes if minutes ago", async () => {
            const event = makeEventWithLastModified("2020-07-18T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T10:06:00" });
            expect(findByAriaLabel(result.container, "Last Modified By")).toHaveTextContent(
                "user, 6 minutes ago",
            );
        });

        it("last modified displays hour if 1 hour ago", async () => {
            const event = makeEventWithLastModified("2020-07-18T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T11:59:59" });
            expect(findByAriaLabel(result.container, "Last Modified By")).toHaveTextContent(
                "user, 1 hour ago",
            );
        });

        it("last modified displays hours if hours ago", async () => {
            const event = makeEventWithLastModified("2020-07-18T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-18T12:00:00" });
            expect(findByAriaLabel(result.container, "Last Modified By")).toHaveTextContent(
                "user, 2 hours ago",
            );
        });

        it("last modified displays day if 1 day ago", async () => {
            const event = makeEventWithLastModified("2020-07-17T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-19T09:59:59" });
            expect(findByAriaLabel(result.container, "Last Modified By")).toHaveTextContent(
                "user, 1 day ago",
            );
        });

        it("last modified displays date if older than 1 week", async () => {
            const event = makeEventWithLastModified("2020-07-17T10:00:00");
            const result = await renderEventDetails({ event, currentTime: "2020-07-24T10:00:00" });
            expect(findByAriaLabel(result.container, "Last Modified By")).toHaveTextContent(
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
