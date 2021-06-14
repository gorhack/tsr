import React from "react";
import { EventForm } from "../../Event/EventForm";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import {
    clearDatePicker,
    fillInDatePicker,
    fillInInputValueInForm,
    getInputValue,
    makeEvent,
    makeEventType,
    makeOrganization,
    makePage,
    reRender,
} from "../TestHelpers";
import selectEvent from "react-select-event";
import { CreatableTsrEvent, TsrEvent } from "../../Event/EventApi";
import td from "testdouble";
import { PageDTO } from "../../api";
import * as OrganizationApi from "../../Organization/OrganizationApi";
import * as EventTypeApi from "../../Event/Type/EventTypeApi";
import { makeBlankCreateableTsrEvent } from "../../Event/CreateEvent";

describe("Event Form", () => {
    const EVENT_NAME_LABEL = "event name";
    const ORGANIZATIONS_LABEL = "organizations";
    const START_DATE_LABEL = "start date";
    const END_DATE_LABEL = "end date";
    const TODAYS_DATE = "12/12/2020";

    const doNothingFn = jest.fn();

    let mockGetEventTypeContains: typeof EventTypeApi.getEventTypeContains;
    let mockGetOrganizationContains: typeof OrganizationApi.getOrganizationContains;

    beforeEach(() => {
        mockGetEventTypeContains = td.replace(EventTypeApi, "getEventTypeContains");
        mockGetOrganizationContains = td.replace(OrganizationApi, "getOrganizationContains");
    });

    describe("Event Form", () => {
        it("displays form title header", async () => {
            await renderEventForm({ submitData: doNothingFn, onCancel: doNothingFn });

            expect(screen.getByRole("heading", { name: "Event Form" })).toBeVisible();
        });

        it("when passed an event, uses it to autofill input fields", () => {
            const dateToInput = new Date("2020-10-18T00:00:01").toLocaleDateString();
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
            const result = render(
                <EventForm
                    event={tsrEvent}
                    formHeader="Event Form"
                    onCancel={doNothingFn}
                    submitData={doNothingFn}
                />,
            );

            expect(getInputValue(screen.getByLabelText(EVENT_NAME_LABEL))).toEqual("name");
            expect(result.container).toHaveTextContent(/.*second.*test type.*/);
            expect(getInputValue(screen.getByLabelText(START_DATE_LABEL))).toContain(dateToInput);
            expect(getInputValue(screen.getByLabelText(END_DATE_LABEL))).toContain(dateToInput);
        });

        it("when cancel is clicked calls the onCancel function", async () => {
            await renderEventForm({ submitData: doNothingFn, onCancel: doNothingFn });

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
            });

            expect(doNothingFn).toHaveBeenCalled();
        });

        it("when submit is clicked calls the submitData function", async () => {
            const orgNames = [
                makeOrganization({
                    organizationId: 2,
                    sortOrder: 2,
                    organizationDisplayName: "first",
                }),
            ];
            const orgNamesPromise = Promise.resolve(makePage({ items: orgNames }));

            const result = await renderEventForm({
                submitData: doNothingFn,
                onCancel: doNothingFn,
                orgNamesPromise: orgNamesPromise,
            });

            fillInInputValueInForm(result, "name", EVENT_NAME_LABEL);
            await selectEvent.select(screen.getByLabelText(ORGANIZATIONS_LABEL), "first");
            fillInDatePicker(result, START_DATE_LABEL, TODAYS_DATE);
            fillInDatePicker(result, END_DATE_LABEL, TODAYS_DATE);

            await act(async () => {
                fireEvent.click(screen.getByRole("button", { name: /submit/i }));
            });

            expect(doNothingFn).toHaveBeenCalled();
        });
    });

    describe("handle errors", () => {
        const submitEventForm = async () => {
            fireEvent.submit(screen.getByTitle("createEventForm"));
            await reRender();
        };

        it("requires event name", async () => {
            const errorMsg = "event name is required and must be less than 255 characters";
            await renderEventForm({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
        });

        it("event name limited to 255 characters", async () => {
            const errorMsg = "event name is required and must be less than 255 characters";
            const result = await renderEventForm({});
            expect(screen.queryByText(errorMsg)).toBeNull();
            const invalidString = "a".repeat(256);
            fillInInputValueInForm(result, invalidString, EVENT_NAME_LABEL);
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
            const result = await renderEventForm({
                orgNamesPromise,
                submitData: doNothingFn,
                onCancel: doNothingFn,
            });
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
            const result = await renderEventForm({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            fillInDatePicker(result, START_DATE_LABEL, "no");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            clearDatePicker(result, START_DATE_LABEL);

            fillInDatePicker(result, START_DATE_LABEL, TODAYS_DATE);
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });

        it("requires end date", async () => {
            const errorMsg = "end date after the start date is required MM/dd/YYYY";
            const result = await renderEventForm({});
            expect(screen.queryByText(errorMsg)).toBeNull();

            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();
            // react-date-picker will always try to make a valid date with a number input
            // TODO? make a test that makes sure end date will always be after start date
            fillInDatePicker(result, END_DATE_LABEL, "asdf");
            await submitEventForm();
            expect(screen.getByText(errorMsg)).toBeInTheDocument();

            clearDatePicker(result, END_DATE_LABEL);

            fillInDatePicker(result, END_DATE_LABEL, TODAYS_DATE);
            await submitEventForm();

            expect(screen.queryByText(errorMsg)).toBeNull();
        });
    });

    interface renderEventFormProps {
        submitData?: () => void;
        onCancel?: () => void;
        event?: TsrEvent | CreatableTsrEvent;
        eventTypesPromise?: Promise<PageDTO<unknown>>;
        orgNamesPromise?: Promise<PageDTO<unknown>>;
    }

    const renderEventForm = async ({
        onCancel = jest.fn(),
        submitData = jest.fn(),
        eventTypesPromise = Promise.resolve(makePage()),
        orgNamesPromise = Promise.resolve(makePage()),
        event = makeBlankCreateableTsrEvent(),
    }: renderEventFormProps): Promise<RenderResult> => {
        td.when(mockGetEventTypeContains("")).thenDo(() => Promise.resolve(eventTypesPromise));
        td.when(mockGetOrganizationContains("")).thenDo(() => Promise.resolve(orgNamesPromise));

        const result = render(
            <EventForm
                event={event}
                formHeader="Event Form"
                onCancel={onCancel}
                submitData={submitData}
            />,
        );

        await act(async () => {
            await orgNamesPromise;
            await eventTypesPromise;
        });

        return result;
    };
});
