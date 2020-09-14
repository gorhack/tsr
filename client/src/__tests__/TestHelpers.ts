import { act, RenderResult } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { Auditable, TsrEvent } from "../Event/EventApi";
import { EventType } from "../Event/Type/EventTypeApi";
import { PageDTO } from "../api";
import { Organization } from "../Organization/OrganizationApi";
import td from "testdouble";
import { SocketService, SocketStatus } from "../SocketService";
import { Client, messageCallbackType, StompHeaders, StompSubscription } from "@stomp/stompjs";

// Define a NockBody any to avoid linter warnings. Nock can take objects of any type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NockBody = any;

export const findByAriaLabel = (container: HTMLElement, ariaLabel: string): Element => {
    const element = container.querySelector(`[aria-label="${ariaLabel}"]`);
    if (element === null) {
        throw new Error(`Unable to find element with aria-label=${ariaLabel}`);
    }
    return element;
};

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

export function makeOrganization(partial: Partial<Organization>): Organization {
    if (!partial.organizationId) {
        throw Error("org names must have an id");
    }
    if (!partial.sortOrder) {
        throw Error("org names must have a sort order");
    }
    return {
        organizationId: partial.organizationId,
        sortOrder: partial.sortOrder,
        organizationDisplayName: partial.organizationDisplayName || "",
        organizationName: partial.organizationName || "",
    };
}

export const makeAudit = (partial: Partial<Auditable>): Auditable => {
    return {
        lastModifiedDate: partial.lastModifiedDate || "",
        lastModifiedBy: partial.lastModifiedBy || "",
        lastModifiedByDisplayName: partial.lastModifiedByDisplayName || "",
        createdDate: partial.createdDate || "",
        createdBy: partial.createdBy || "",
        createdByDisplayName: partial.createdByDisplayName || "",
    };
};

export const makeEvent = (partial: Partial<TsrEvent>): TsrEvent => {
    if (!partial.eventId) {
        throw Error("events must have an id");
    }
    return {
        eventId: partial.eventId,
        eventName: partial.eventName || "",
        startDate: partial.startDate || "",
        endDate: partial.endDate || "",
        organization: makeOrganization({ organizationId: 1, sortOrder: 1 }),
        eventType: partial.eventType || undefined,
        audit: partial.audit || makeAudit({}),
    };
};

export const makePage = (partial?: Partial<PageDTO<unknown>>): PageDTO<unknown> => {
    // warning, type must be unknown if using helper...
    const items = partial?.items || [];
    return {
        items,
        totalPages: partial?.totalPages || 1,
        pageNumber: partial?.pageNumber || 0,
        pageSize: partial?.pageSize || 10,
        totalResults: items.length,
        first: !!partial?.first,
        last: !!partial?.last,
    };
};

export const mockSocketService = (): SocketService => {
    const socketService = new SocketService({ create: false, status: SocketStatus.CONNECTED });
    const readyCall = td.replace(socketService, "ready");
    td.when(readyCall()).thenReturn(true);

    td.replace(socketService, "client");
    socketService.client = {
        subscribe: (
            subscribeTopic: string,
            callback: messageCallbackType,
            headers?: StompHeaders,
        ): StompSubscription => {
            const subscriptionId = headers
                ? headers.id
                : "generated-subscription-id-" + Math.random() * 100;
            return {
                id: subscriptionId,
                unsubscribe: (): void => {
                    // do nothing
                },
            };
        },
    } as Client;
    const shutdown = td.replace(socketService, "shutdown");
    td.when(shutdown()).thenDo(() => Promise.resolve());
    const unsubscribe = td.replace(socketService, "unsubscribe");
    td.when(unsubscribe()).thenDo(() => Promise.resolve());

    return socketService;
};

export const callSocketSubscriptionHandler = (
    mockedSocketService: SocketService,
    topic: string,
    subscriptionId: string,
    expectedServerMessage: unknown,
): void => {
    act((): void => {
        mockedSocketService.sendMessageToTopicIdHandler(
            topic,
            subscriptionId,
            JSON.stringify(expectedServerMessage),
        );
    });
};

export const reRender = async (): Promise<void> => {
    await act(async () => {
        await new Promise((resolve) => setImmediate(resolve));
    });
};
