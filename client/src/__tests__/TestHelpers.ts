import { act, fireEvent, RenderResult } from "@testing-library/react";
import { EventType, TsrEvent } from "../Events/EventApi";

// Define a NockBody any to avoid linter warnings. Nock can take objects of any type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NockBody = any;

export const fillInInputValueInForm = (
    container: RenderResult,
    newValue: string | number,
    labelText?: string,
    placeholderText?: string,
    includeValidation = true,
): void => {
    const input = getInputValueType(container, labelText, placeholderText);
    fireEvent.change(input, { target: { value: newValue } });
    fireEvent.blur(input); // lol HACK to trigger validation
    if (includeValidation) {
        expect(input.value).toEqual(newValue.toString());
    }
};

const getInputValueType = (
    container: RenderResult,
    label?: string,
    placeholder?: string,
): HTMLInputElement => {
    if (label && placeholder) {
        throw new Error("fillInInputValueInForm can take either a label OR a placeholder value");
    } else if (label) {
        return container.getByLabelText(label) as HTMLInputElement;
    } else if (placeholder) {
        return container.getByPlaceholderText(placeholder) as HTMLInputElement;
    } else {
        throw new Error("fillInInputValueInForm must take either a label OR a placeholder value");
    }
};

export function makeEventType(partial: Partial<EventType>): EventType {
    if (!partial.eventTypeId) {
        throw Error("event types must have an id");
    }
    if (!partial.sortOrder) {
        throw Error("event types must have a sort order");
    }
    return {
        eventTypeId: partial.eventTypeId,
        sortOrder: partial.sortOrder,
        displayName: partial.displayName || "",
        eventTypeName: partial.eventTypeName || "",
    };
}

export const makeEvent = (partial: Partial<TsrEvent>): TsrEvent => {
    if (!partial.eventId) {
        throw Error("events must have an id");
    }
    return {
        eventId: partial.eventId,
        eventName: partial.eventName || "",
        startDate: partial.startDate || "",
        endDate: partial.endDate || "",
        organization: partial.organization || "",
        eventType: partial.eventType || undefined,
        lastModifiedDate: partial.lastModifiedDate || "",
        lastModifiedBy: partial.lastModifiedBy || "",
        createdDate: partial.createdDate || "",
        createdBy: partial.createdBy || "",
    };
};

export const reRender = async (): Promise<void> => {
    await act(async () => {
        await new Promise((resolve) => setImmediate(resolve));
    });
};
