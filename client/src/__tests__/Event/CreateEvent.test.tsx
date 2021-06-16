import "mutationobserver-shim";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { CreateEvent } from "../../Event/CreateEvent";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory, MemoryHistory } from "history";
import {
    fillInDatePicker,
    fillInInputValueInForm,
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
    let mockGetEventTypeContains: typeof EventTypeApi.getEventTypeContains;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;
    let mockCurrentDate: typeof Api.currentDate;
    let mockDatePlusYears: typeof Api.datePlusYears;
    beforeEach(() => {
        mockSaveEvent = td.replace(EventApi, "saveEvent");
        mockGetEventTypeContains = td.replace(EventTypeApi, "getEventTypeContains");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
        mockCurrentDate = td.replace(Api, "currentDate");
        mockDatePlusYears = td.replace(Api, "datePlusYears");
    });

    afterEach(td.reset);

    it("displays correct event form header", async () => {
        await renderCreateEvent({});

        expect(screen.getByRole("heading", { name: "Create an Event" })).toBeVisible();
    });

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

    it("submitting the form saves event and goes to /eventId", async () => {
        const startDate = new Date(TODAYS_DATE);
        const endDate = new Date(TODAYS_DATE);
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
        expect(history.location.pathname).toEqual("/event/1");
    });

    const submitEventForm = async () => {
        fireEvent.click(screen.getByRole("button", { name: /submit/i }));
        await reRender();
    };

    interface RenderCreateEventProps {
        history?: MemoryHistory;
        eventTypesPromise?: Promise<PageDTO<unknown>>;
        orgNamesPromise?: Promise<PageDTO<unknown>>;
    }

    const renderCreateEvent = async ({
        history = createMemoryHistory(),
        eventTypesPromise = Promise.resolve(makePage()),
        orgNamesPromise = Promise.resolve(makePage()),
    }: RenderCreateEventProps): Promise<RenderResult> => {
        history.push("/createEvent");

        td.when(mockGetEventTypeContains("")).thenDo(() => Promise.resolve(eventTypesPromise));
        td.when(mockGetOrganizationContains("")).thenDo(() => Promise.resolve(orgNamesPromise));
        td.when(mockDatePlusYears(10)).thenReturn(1923292800000); // 12/12/2030

        const path = "/createEvent";
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
