import { fireEvent, RenderResult, act } from "@testing-library/react";
import { EventType, TsrEvent } from "../Events/EventApi";

// Define a NockBody any to avoid linter warnings. Nock can take objects of any type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NockBody = any;

export const fillInInputValueInForm = (
    container: RenderResult,
    label: string,
    newValue: string | number,
    includeValidation = true,
    placeholder?: boolean,
): void => {
    const input = getInputValueType(container, label, placeholder);
    fireEvent.change(input, { target: { value: newValue } });
    fireEvent.blur(input); // lol HACK to trigger validation
    if (includeValidation) {
        expect(input.value).toEqual(newValue.toString());
    }
};

const getInputValueType = (
    container: RenderResult,
    label: string,
    placeholder?: boolean,
): HTMLInputElement => {
    return placeholder
        ? (container.getByPlaceholderText(label) as HTMLInputElement)
        : (container.getByLabelText(label) as HTMLInputElement);
};

export function makeEventType(partial: Partial<EventType>): EventType {
    if (!partial.sortOrder) {
        throw Error("event types must have a sort order");
    }
    return {
        sortOrder: partial.sortOrder,
        displayName: partial.displayName || "",
        eventName: partial.eventName || "",
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
    };
};

export const reRender = async (): Promise<void> => {
    await act(async () => {
        await new Promise((resolve) => setImmediate(resolve));
    });
};
