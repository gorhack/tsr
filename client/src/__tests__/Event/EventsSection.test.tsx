import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import React from "react";
import td from "testdouble";
import { EventsSection } from "../../Event/EventsSection";
import { createMemoryHistory, MemoryHistory } from "history";
import * as EventApi from "../../Event/EventApi";
import { TsrEvent } from "../../Event/EventApi";
import { makeAudit, makeEvent, makeOrganization } from "../TestHelpers";
import { Route, Router } from "react-router-dom";
import { PageDTO } from "../../api";
import { Organization } from "../../Organization/OrganizationApi";

describe("home page of the application", () => {
    let mockGetActiveEventsByOrganizationIds: typeof EventApi.getActiveEventsByOrganizationIds;
    let mockGetActiveEventsByUserId: typeof EventApi.getActiveEventsByUserId;
    let userEventList: TsrEvent[];
    let orgEventList: TsrEvent[];
    let organization: Organization;
    let userPage1: PageDTO<TsrEvent>;
    let userPage2: PageDTO<TsrEvent>;
    let orgPage1: PageDTO<TsrEvent>;
    let orgPage2: PageDTO<TsrEvent>;
    beforeEach(() => {
        mockGetActiveEventsByOrganizationIds = td.replace(
            EventApi,
            "getActiveEventsByOrganizationIds",
        );
        mockGetActiveEventsByUserId = td.replace(EventApi, "getActiveEventsByUserId");
        organization = makeOrganization({
            organizationId: 1,
            organizationDisplayName: "org 1",
            sortOrder: 1,
        });
        userEventList = [
            makeEvent({
                eventId: 1,
                eventName: "first event",
                audit: makeAudit({ createdBy: "1234" }),
            }),
            makeEvent({
                eventId: 2,
                eventName: "second event",
                organization,
                audit: makeAudit({ createdBy: "1234" }),
            }),
        ];
        orgEventList = [
            userEventList[1],
            makeEvent({
                eventId: 3,
                eventName: "third event",
                organization,
                audit: makeAudit({ createdBy: "0987" }),
            }),
        ];
        userPage1 = {
            items: [userEventList[0]],
            pageNumber: 0,
            pageSize: 1,
            totalPages: 2,
            totalResults: userEventList.length,
            first: true,
            last: false,
        };
        userPage2 = {
            items: [userEventList[1]],
            pageNumber: 1,
            pageSize: 1,
            totalPages: 2,
            totalResults: userEventList.length,
            first: false,
            last: true,
        };
        orgPage1 = { ...userPage1, items: [orgEventList[0]] };
        orgPage2 = { ...userPage2, items: [orgEventList[1]] };
    });

    afterEach(td.reset);

    it("lists all users org events", async () => {
        await renderEventsSection({ orgEvents: orgEventList });

        expect(screen.getByTestId("org-event-2")).toHaveTextContent("second event");
        expect(screen.getByTestId("org-event-3")).toHaveTextContent("third event");
    });

    it("shows load more if more org event pages", async () => {
        await renderEventsSection({
            orgEvents: orgEventList,
            orgPage: orgPage1,
        });
        const loadMoreButton = screen.getByTestId("org-event-more");
        expect(screen.getByText("second event")).toBeInTheDocument();
        expect(screen.queryByText("third event")).toBeNull();

        expect(loadMoreButton).toHaveTextContent("load more");
        const moreEventsPromise: Promise<PageDTO<TsrEvent>> = Promise.resolve(orgPage2);
        td.when(mockGetActiveEventsByOrganizationIds({ page: 1 })).thenDo(() =>
            Promise.resolve(moreEventsPromise),
        );
        fireEvent.click(loadMoreButton);
        await act(async () => {
            await moreEventsPromise;
        });

        expect(screen.getByText("second event")).toBeInTheDocument();
        expect(screen.getByText("third event")).toBeInTheDocument();
        expect(screen.queryByTestId("org-event-more")).toBeNull();
    });

    it("lists events created by logged in user", async () => {
        await renderEventsSection({
            userEvents: userEventList,
        });

        expect(screen.getByTestId("user-event-1")).toHaveTextContent("first event");
        expect(screen.getByTestId("user-event-2")).toHaveTextContent("second event");
    });

    it("shows next if more user event pages", async () => {
        await renderEventsSection({
            userEvents: userEventList,
            userPage: userPage1,
        });
        const nextButton = screen.getByTestId("user-event-more");
        expect(screen.getByText("first event")).toBeInTheDocument();
        expect(screen.queryByText("second event")).toBeNull();

        expect(nextButton).toHaveTextContent("load more");
        const moreEventsPromise: Promise<PageDTO<TsrEvent>> = Promise.resolve(userPage2);
        td.when(mockGetActiveEventsByUserId({ page: 1 })).thenDo(() =>
            Promise.resolve(moreEventsPromise),
        );
        fireEvent.click(nextButton);
        await act(async () => {
            await moreEventsPromise;
        });

        expect(screen.queryByText("first event")).toBeInTheDocument();
        expect(screen.getByText("second event")).toBeInTheDocument();
        expect(screen.queryByTestId("user-event-more")).toBeNull();
    });

    it("clicking on an event goes to event details", async () => {
        const history = createMemoryHistory();
        await renderEventsSection({
            userEvents: [makeEvent({ eventId: 1, eventName: "this event" })],
            history,
        });
        fireEvent.click(screen.getByText("this event"));
        expect(history.location.pathname).toEqual("/event/1");
    });

    interface RenderEventsSectionProps {
        orgEvents?: TsrEvent[];
        userEvents?: TsrEvent[];
        history?: MemoryHistory;
        userPage?: PageDTO<TsrEvent>;
        orgPage?: PageDTO<TsrEvent>;
    }

    const renderEventsSection = async ({
        orgEvents = [],
        userEvents = [],
        history = createMemoryHistory(),
        userPage = {
            items: userEvents,
            pageNumber: 0,
            pageSize: 10,
            totalPages: 1,
            totalResults: userEvents.length,
            first: true,
            last: true,
        },
        orgPage = {
            ...userPage,
            items: orgEvents,
            totalResults: orgEvents.length,
        },
    }: RenderEventsSectionProps): Promise<RenderResult> => {
        const userEventsPromise = Promise.resolve(userPage);
        const orgEventsPromise = Promise.resolve(orgPage);
        td.when(mockGetActiveEventsByOrganizationIds()).thenDo(() =>
            Promise.resolve(orgEventsPromise),
        );
        td.when(mockGetActiveEventsByUserId()).thenDo(() => Promise.resolve(userEventsPromise));

        history.push("/");
        const result = render(
            <Router history={history}>
                <Route path="/">
                    <EventsSection />
                </Route>
            </Router>,
        );
        await act(async () => {
            await userEventsPromise;
            await orgEventsPromise;
        });
        return result;
    };
});
