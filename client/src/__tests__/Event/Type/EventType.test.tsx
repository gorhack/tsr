import React, { ReactElement, useReducer, useState } from "react";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { makeEventType, makePage } from "../../TestHelpers";
import td from "testdouble";
import { eventTypesCacheReducer, Option, PageDTO } from "../../../api";
import * as EventTypeApi from "../../../Event/Type/EventTypeApi";
import { EventType } from "../../../Event/Type/EventTypeApi";
import selectEvent from "react-select-event";
import { EventTypeSelect } from "../../../Event/Type/EventType";
import { useForm } from "react-hook-form";
import "mutationobserver-shim";

describe("event type select", () => {
    const EVENT_TYPE_LABEL = "event type";

    let mockCreateEventType: typeof EventTypeApi.createEventType;
    let mockGetEventTypeContains: typeof EventTypeApi.getEventTypeContains;

    beforeEach(() => {
        mockCreateEventType = td.replace(EventTypeApi, "createEventType");
        mockGetEventTypeContains = td.replace(EventTypeApi, "getEventTypeContains");
    });

    it("can clear the event types", async () => {
        await setupEventSelectPromise();
        await selectEvent.select(screen.getByLabelText(EVENT_TYPE_LABEL), "second");
        expect(screen.getByText("second")).toBeInTheDocument();
        await selectEvent.clearAll(screen.getByLabelText(EVENT_TYPE_LABEL));
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
            await selectEvent.create(screen.getByLabelText(EVENT_TYPE_LABEL), "fourth");
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
        fireEvent.change(screen.getByLabelText(EVENT_TYPE_LABEL), {
            target: { value: "fou" },
        });
        await selectEvent.select(screen.getByLabelText(EVENT_TYPE_LABEL), "fourth");
        expect(screen.getByText("fourth")).toBeInTheDocument();
    });

    const setupEventSelectPromise = async (): Promise<RenderResult> => {
        const eventTypes = [
            makeEventType({ eventTypeId: 1, sortOrder: 1, displayName: "first" }),
            makeEventType({ eventTypeId: 2, sortOrder: 2, displayName: "second" }),
            makeEventType({ eventTypeId: 3, sortOrder: 3, displayName: "third" }),
        ];
        const eventTypesPromise = Promise.resolve(makePage({ items: eventTypes }));
        td.when(mockGetEventTypeContains("")).thenDo(() => Promise.resolve(eventTypesPromise));

        const result = render(<EventSelectTestComponent />);

        await act(async () => {
            await eventTypesPromise;
        });
        return result;
    };
});

const EventSelectTestComponent = (): ReactElement => {
    const { control } = useForm();
    const [eventTypeValue, setEventTypeValue] = useState<Option | undefined>(undefined);
    return (
        <EventTypeSelect
            control={control}
            dispatchToEventTypeCache={useReducer(eventTypesCacheReducer, [])[1]}
            selectedEventType={eventTypeValue}
            setSelectedEventType={setEventTypeValue}
        />
    );
};
