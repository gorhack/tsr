import { act, fireEvent, RenderResult } from "@testing-library/react";
import { Auditable, TsrEvent } from "../Event/EventApi";
import { EventType } from "../Event/Type/EventTypeApi";
import { PageDTO } from "../api";
import { Organization } from "../Organization/OrganizationApi";
import td from "testdouble";
import { SocketService, SocketStatus } from "../SocketService";
import { Client, messageCallbackType, StompHeaders, StompSubscription } from "@stomp/stompjs";
import {
    EventTask,
    EventTaskCategory,
    EventTaskComment,
    EventTaskStatus,
    StatusCode,
} from "../Event/Task/EventTaskApi";
import { TsrUser } from "../Users/UserApi";
import userEvent from "@testing-library/user-event";

// Define a NockBody any to avoid linter warnings. Nock can take objects of any type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NockBody = any;

export const getInputValue = (element: HTMLElement): string => {
    return (element as HTMLInputElement).value;
};

export const findByAriaLabel = (container: Element, ariaLabel: string): Element => {
    const element = container.querySelector(`[aria-label="${ariaLabel}"]`);
    if (element === null) {
        throw new Error(`Unable to find element with aria-label=${ariaLabel}`);
    }
    return element;
};

export const fillInInputValueInForm = (
    container: RenderResult,
    newValue: string | number,
    labelText: string,
    includeValidation = true,
): void => {
    const input = container.getByLabelText(labelText) as HTMLInputElement;
    fireEvent.change(input, { target: { value: newValue } });
    fireEvent.blur(input); // lol HACK to trigger validation
    if (includeValidation) {
        expect(input.value).toEqual(newValue.toString());
    }
};

export const fillInDatePicker = (container: RenderResult, name: string, dateVal: string): void => {
    const datePicker = container.getByRole("textbox", { name });
    userEvent.type(datePicker, dateVal);
};

export const datePickerNextDay = (container: RenderResult, name: string): void => {
    const datePicker = container.getByRole("textbox", { name });
    userEvent.click(datePicker);
    userEvent.tab();
    userEvent.type(datePicker, "{arrowright}{enter}");
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
        organizations: partial.organizations || [
            makeOrganization({ organizationId: 1, sortOrder: 1 }),
        ],
        eventType: partial.eventType || undefined,
        audit: partial.audit || makeAudit({}),
    };
};

export const makeEventTaskStatus = (partial: Partial<EventTaskStatus>): EventTaskStatus => {
    return {
        statusId: partial.statusId || 0,
        statusName: partial.statusName || "",
        statusDisplayName: partial.statusDisplayName || "",
        statusShortName: partial.statusShortName || StatusCode.R,
        sortOrder: partial.sortOrder || 0,
    };
};

export const makeTsrUser = (partial: Partial<TsrUser>): TsrUser => {
    return {
        userId: partial.userId || "",
        username: partial.username || "",
        role: partial.role || "USER",
        settings: partial.settings || {
            organizations: [],
        },
    };
};

export const makeEventTaskCategory = (partial: Partial<EventTaskCategory>): EventTaskCategory => {
    if (!partial.eventTaskCategoryId) {
        throw Error("event task category must have event task id");
    }
    return {
        eventTaskCategoryId: partial.eventTaskCategoryId,
        eventTaskDisplayName: partial.eventTaskDisplayName || "",
        eventTaskName: partial.eventTaskName || "",
    };
};

export const makeEventTaskComment = (partial: Partial<EventTaskComment>): EventTaskComment => {
    if (!partial.commentId) {
        throw Error("event task comment must have an id");
    }
    if (!partial.eventTaskId) {
        throw Error("event task comment must have an event task id");
    }
    return {
        commentId: partial.commentId,
        eventTaskId: partial.eventTaskId,
        annotation: partial.annotation || "",
        audit: partial.audit || makeAudit({}),
    };
};

export const makeEventTask = (partial: Partial<EventTask>): EventTask => {
    if (!partial.eventId) {
        throw Error("event task must have an event id");
    }
    if (!partial.eventTaskCategory) {
        throw Error("event task must have event task category");
    }
    return {
        eventId: partial.eventId,
        eventTaskId: partial.eventTaskId || partial.eventTaskCategory.eventTaskCategoryId,
        eventTaskCategory: partial.eventTaskCategory,
        suspenseDate: partial.suspenseDate || "",
        status: partial.status || makeEventTaskStatus({}),
        approver: partial.approver || makeTsrUser({}),
        resourcer: partial.resourcer || makeTsrUser({}),
        comments: partial.comments || [],
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
                : `generated-subscription-id-${Math.random() * 100}`;
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
