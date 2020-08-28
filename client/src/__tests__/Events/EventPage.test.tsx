import { act, render, screen } from "@testing-library/react";
import React from "react";
import td from "testdouble";
import * as EventApi from "../../Events/EventApi";
import * as api from "../../api";
import { createMemoryHistory } from "history";
import { Route, Router } from "react-router-dom";
import { makeEvent } from "../TestHelpers";

describe("displays event details", () => {
    let mockGetEvent: typeof EventApi.getEventById;
    let mockCurrentTime: typeof api.currentTime;
    beforeEach(() => {
        mockGetEvent = td.replace(EventApi, "getEventById");
        mockCurrentTime = td.replace(api, "currentTime");
        const timeNow = new Date("2020-07-19T12:31:59");
        td.when(mockCurrentTime()).thenDo(() => timeNow);
    });
    afterEach(td.reset);

    it("displays event details", async () => {
        const event = makeEvent({
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
            createdDate: "2020-07-18T06:15:59",
            lastModifiedDate: "2020-07-18T11:26:59",
        });
        await renderEventDetails(event);
        const title = screen.getByText("first event details");
        expect(title.tagName).toEqual("H1");
        const subheading = screen.getByText("07/18/2020-07/20/2020");
        expect(subheading.tagName).toEqual("H2");
        expect(screen.getByText("event type: big")).toBeInTheDocument();
        expect(
            screen.getByText(
                "start date: Fri Aug 18 2020 14:15:59 GMT-0700 (Pacific Daylight Time)",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText("end date: Fri Aug 20 2020 01:00:01 GMT-0700 (Pacific Daylight Time)"),
        ).toBeInTheDocument();
        expect(screen.getByText("organization: ragnar")).toBeInTheDocument();
        expect(
            screen.getByText("created by modified by: test_user (18/07/2020)"),
        ).toBeInTheDocument();
        expect(screen.getByText("last modified by: test_user_2 (1 day ago)")).toBeInTheDocument();
    });

    it("only one date if start and end date are the exact same", async () => {
        const event = makeEvent({
            eventId: 2,
            eventName: "another event",
            startDate: "2020-08-18T14:15:59",
            endDate: "2020-08-18T14:15:59",
        });
        await renderEventDetails(event);
        expect(screen.getByText("07/18/2020").tagName).toEqual("H2");
        expect(
            screen.getByText("date: Fri Aug 18 2020 14:15:59 GMT-0700 (Pacific Daylight Time)"),
        ).toBeInTheDocument();
    });

    describe("last modified", () => {
        it("last modified in the last 5 minutes displays just now", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedDate: "2020-07-18T11:22:00",
            });
            await renderEventDetails(event);
            expect(screen.getByText("last modified: just now...")).toBeInTheDocument();
        });

        it("last modified displays minutes if minutes ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedDate: "2020-07-18T11:18:00",
            });
            await renderEventDetails(event);
            expect(
                screen.getByText("last modified by: test_user_2 13 minutes ago"),
            ).toBeInTheDocument();
        });

        it("last modified displays hour if 1 hour ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedDate: "2020-07-18T10:18:00",
            });
            await renderEventDetails(event);
            expect(
                screen.getByText("last modified by: test_user_2 1 hour ago"),
            ).toBeInTheDocument();
        });

        it("last modified displays hours if hours ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedDate: "2020-07-18T09:18:00",
            });
            await renderEventDetails(event);
            expect(
                screen.getByText("last modified by: test_user_2 2 hours ago"),
            ).toBeInTheDocument();
        });

        it("last modified displays day if 1 day ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedDate: "2020-07-17T09:18:00",
            });
            await renderEventDetails(event);
            expect(screen.getByText("last modified by: test_user_2 1 day ago")).toBeInTheDocument();
        });

        it("last modified displays days if days ago", async () => {
            const event = makeEvent({
                eventId: 1,
                lastModifiedDate: "2020-07-16T09:18:00",
            });
            await renderEventDetails(event);
            expect(
                screen.getByText("last modified by: test_user_2 2 days ago"),
            ).toBeInTheDocument();
        });
    });

    const renderEventDetails = async (
        event = makeEvent({ eventId: 1 }),
        history = createMemoryHistory(),
    ) => {
        const eventPromise = Promise.resolve(event);
        td.when(mockGetEvent(event.eventId)).thenResolve(eventPromise);

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
