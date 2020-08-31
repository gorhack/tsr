import { act, render, screen } from "@testing-library/react";
import React from "react";
import td from "testdouble";
import * as EventApi from "../../Events/EventApi";
import * as Api from "../../api";
import { EventPage } from "../../Events/EventPage";
import { createMemoryHistory, MemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import { makeEvent } from "../TestHelpers";
import { TsrEvent } from "../../Events/EventApi";
import moment from "moment";

describe("displays event details", () => {
    let mockGetEventById: typeof EventApi.getEventById;
    let mockUserTimeZone: typeof Api.userTimeZone;
    let mockCurrentTime: typeof Api.currentTime;

    beforeEach(() => {
        mockGetEventById = td.replace(EventApi, "getEventById");
        mockUserTimeZone = td.replace(Api, "userTimeZone");
        mockCurrentTime = td.replace(Api, "currentTime");
    });
    afterEach(td.reset);

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
                startDate: "2020-08-18T14:15:59",
                endDate: "2020-08-20T01:00:01",
                organization: "ragnar",
                createdBy: "1234",
                createdByDisplayName: "test_user",
                createdDate: "2020-07-18T06:15:59",
                lastModifiedBy: "6789",
                lastModifiedByDisplayName: "test_user_2",
                lastModifiedDate: "2020-07-18T10:00:00",
            };

            await renderEventDetails({ event });
            const title = screen.getByText("first event details");
            expect(title.tagName).toEqual("H1");
            const subheading = screen.getByText("Tue Aug 18, 2020 - Thu Aug 20, 2020");
            expect(subheading.tagName).toEqual("H2");
            expect(screen.getByText("type: big")).toBeInTheDocument();
            expect(
                screen.getByText("start date: Tuesday, August 18th 2020, 1415 (TIMEZONE/timezone)"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("end date: Thursday, August 20th 2020, 0100 (TIMEZONE/timezone)"),
            ).toBeInTheDocument();
            expect(screen.getByText("organization: ragnar")).toBeInTheDocument();
            expect(screen.getByText("created by test_user (7/18/20)")).toBeInTheDocument();
            expect(screen.getByText("last modified by test_user_2 2 days ago")).toBeInTheDocument();
        });

        it("only one date if start and end date are the exact same", async () => {
            const event = makeEvent({
                eventId: 2,
                eventName: "another event",
                startDate: "2020-08-18T14:15:59",
                endDate: "2020-08-18T14:15:59",
            });
            await renderEventDetails({ event });
            expect(screen.getByText("Tue Aug 18, 2020").tagName).toEqual("H2");
            expect(
                screen.getByText("date: Tuesday, August 18th 2020, 1415 (TIMEZONE/timezone)"),
            ).toBeInTheDocument();
        });
    });

    describe("last modified", () => {
        it("last modified in the last 5 minutes displays just now", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedByDisplayName: "user",
                lastModifiedDate: "2020-07-18T10:00:00",
            });
            await renderEventDetails({ event, currentTime: "2020-07-18T10:05:59" });
            expect(screen.getByText("last modified by user just now...")).toBeInTheDocument();
        });

        it("last modified displays minutes if minutes ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedByDisplayName: "user",
                lastModifiedDate: "2020-07-18T10:00:00",
            });
            await renderEventDetails({ event, currentTime: "2020-07-18T10:06:00" });
            expect(screen.getByText("last modified by user 6 minutes ago")).toBeInTheDocument();
        });

        it("last modified displays hour if 1 hour ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedByDisplayName: "user",
                lastModifiedDate: "2020-07-18T10:00:00",
            });
            await renderEventDetails({ event, currentTime: "2020-07-18T11:59:59" });
            expect(screen.getByText("last modified by user 1 hour ago")).toBeInTheDocument();
        });

        it("last modified displays hours if hours ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedByDisplayName: "user",
                lastModifiedDate: "2020-07-18T10:00:00",
            });
            await renderEventDetails({ event, currentTime: "2020-07-18T12:00:00" });
            expect(screen.getByText("last modified by user 2 hours ago")).toBeInTheDocument();
        });

        it("last modified displays day if 1 day ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedByDisplayName: "user",
                lastModifiedDate: "2020-07-17T10:00:00",
            });
            await renderEventDetails({ event, currentTime: "2020-07-19T09:59:59" });
            expect(screen.getByText("last modified by user 1 day ago")).toBeInTheDocument();
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
    }: RenderEventDetailsProps) => {
        history.push(`/event/${event.eventId}`);
        const eventPromise = Promise.resolve(event);
        td.when(mockGetEventById(event.eventId)).thenResolve(await eventPromise);
        td.when(mockUserTimeZone()).thenReturn("TIMEZONE/timezone");
        td.when(mockCurrentTime()).thenReturn(moment(currentTime));

        const result = render(
            <Router history={history}>
                <Route path="/event/:eventId">
                    <EventPage />
                </Route>
            </Router>,
        );
        await act(async () => {
            await eventPromise;
        });
        return result;
    };
});
