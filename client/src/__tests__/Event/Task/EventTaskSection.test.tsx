import "mutationobserver-shim";
import React from "react";
import td from "testdouble";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { EventTaskSection } from "../../../Event/Task/EventTaskSection";
import * as EventTaskApi from "../../../Event/Task/EventTaskApi";
import { EventTask, EventTaskCategory } from "../../../Event/Task/EventTaskApi";
import selectEvent from "react-select-event";
import { SocketSubscriptionTopics, TsrEvent } from "../../../Event/EventApi";
import {
    callSocketSubscriptionHandler,
    datePickerNextDay,
    fillInInputValueInForm,
    makeAudit,
    makeEvent,
    makeEventTask,
    makeEventTaskCategory,
    makeEventTaskComment,
    makeEventTaskStatus,
    makePage,
    makeTsrUser,
    mockSocketService,
    reRender,
} from "../../TestHelpers";
import { PageDTO } from "../../../api";
import { SocketService } from "../../../SocketService";
import { StompSocketProvider } from "../../../StompSocketContext";

describe("event tasks", () => {
    let mockCreateEventTaskCategory: typeof EventTaskApi.createEventTaskCategory;
    let mockGetEventTaskCategories: typeof EventTaskApi.getEventTaskCategoriesContains;
    let mockCreateEventTask: typeof EventTaskApi.createEventTask;
    let mockGetEventTasks: typeof EventTaskApi.getEventTasks;
    let mockAddComment: typeof EventTaskApi.addComment;
    let mockUpdateEventTaskSuspense: typeof EventTaskApi.updateEventTaskSuspense;
    let tsrEvent: TsrEvent;
    let firstEventTaskCategory: EventTaskCategory;
    let eventTask: EventTask;

    beforeEach(() => {
        mockGetEventTaskCategories = td.replace(EventTaskApi, "getEventTaskCategoriesContains");
        mockCreateEventTask = td.replace(EventTaskApi, "createEventTask");
        mockGetEventTasks = td.replace(EventTaskApi, "getEventTasks");
        mockAddComment = td.replace(EventTaskApi, "addComment");
        mockCreateEventTaskCategory = td.replace(EventTaskApi, "createEventTaskCategory");
        tsrEvent = makeEvent({ eventId: 1 });
        mockUpdateEventTaskSuspense = td.replace(EventTaskApi, "updateEventTaskSuspense");
        tsrEvent = makeEvent({ eventId: 1, startDate: "2020-08-18T00:00:01" });
        firstEventTaskCategory = makeEventTaskCategory({
            eventTaskCategoryId: 1,
            eventTaskDisplayName: "task 1",
        });
        eventTask = {
            eventTaskId: 1,
            eventTaskCategory: firstEventTaskCategory,
            eventId: tsrEvent.eventId,
            suspenseDate: "2020-08-18T00:00:01",
            approver: makeTsrUser({ username: "approver user" }),
            resourcer: makeTsrUser({ username: "resourcer user" }),
            status: makeEventTaskStatus({ sortOrder: 2 }),
            comments: [],
        };
    });

    afterEach(td.reset);

    it("create a task makes multiple tasks when passed more than 1", async () => {
        await renderEventTasks({});
        await selectEvent.select(screen.getByLabelText("add tasks"), "task 1");
        expect(screen.queryByTestId("task 1")).not.toBeInTheDocument();
        await selectEvent.select(screen.getByLabelText("add tasks"), "task 2");
        expect(screen.queryByTestId("task 2")).not.toBeInTheDocument();
        await act(async () => {
            await fireEvent.click(screen.getByRole("button", { name: "add tasks" }));
        });
        td.verify(mockCreateEventTask(tsrEvent.eventId, td.matchers.anything()), { times: 2 });
    });

    it("create a task takes the task in as arg", async () => {
        await renderEventTasks({});
        await selectEvent.select(screen.getByLabelText("add tasks"), "task 1");
        expect(screen.queryByTestId("task 1")).not.toBeInTheDocument();
        await act(async () => {
            await fireEvent.click(screen.getByRole("button", { name: "add tasks" }));
        });
        td.verify(mockCreateEventTask(tsrEvent.eventId, firstEventTaskCategory), { times: 1 });
    });

    it("creates a task category", async () => {
        await renderEventTasks({});
        td.when(mockGetEventTaskCategories(td.matchers.anything())).thenResolve(
            makePage() as PageDTO<EventTaskCategory>,
        );
        td.when(
            mockCreateEventTaskCategory({
                eventTaskCategoryId: 0,
                eventTaskName: "first",
                eventTaskDisplayName: "first",
            }),
        ).thenResolve({
            eventTaskCategoryId: 1,
            eventTaskName: "first",
            eventTaskDisplayName: "first",
        });
        await act(async () => {
            await selectEvent.create(screen.getByLabelText("add tasks"), "first", {
                waitForElement: false,
            });
        });
        expect(screen.getByText("first")).toBeInTheDocument();
    });

    it("shows tasks in order of status R->Y->G", async () => {
        const eventTasks: EventTask[] = [
            makeEventTask({
                eventId: 1,
                eventTaskCategory: makeEventTaskCategory({
                    eventTaskCategoryId: 3,
                    eventTaskDisplayName: "last task",
                }),
                status: makeEventTaskStatus({
                    sortOrder: 10,
                }),
            }),
            makeEventTask({
                eventId: 1,
                eventTaskCategory: makeEventTaskCategory({
                    eventTaskCategoryId: 2,
                    eventTaskDisplayName: "second task",
                }),
                status: makeEventTaskStatus({
                    sortOrder: 5,
                }),
            }),
            eventTask,
        ];
        const result = await renderEventTasks({ eventTasks });
        expect(result.container).toHaveTextContent(/.*task 1.*second task.*last task.*/);
    });

    it("shows details when task is clicked and hides when clicked again", async () => {
        await renderEventTasks({
            eventTasks: [
                {
                    ...eventTask,
                    comments: [
                        makeEventTaskComment({
                            commentId: 1,
                            eventTaskId: eventTask.eventTaskId,
                            annotation: "this is an annotation",
                            audit: makeAudit({ createdByDisplayName: "someone" }),
                        }),
                        makeEventTaskComment({
                            commentId: 2,
                            eventTaskId: eventTask.eventTaskId,
                            annotation: "another annotation",
                            audit: makeAudit({ createdByDisplayName: "someone else" }),
                        }),
                    ],
                },
            ],
        });

        fireEvent.click(
            screen.getByRole("button", { name: firstEventTaskCategory.eventTaskDisplayName }),
        );
        expect(screen.getByLabelText("suspense date")).toHaveTextContent(
            /(Mon|Tue) Aug (17|18), 2020/,
        );

        expect(screen.getByLabelText("approver")).toHaveTextContent("user");
        expect(screen.getByLabelText("resourcer")).toHaveTextContent("user");
        expect(screen.getByLabelText("someone")).toHaveTextContent("this is an annotation");
        expect(screen.getByLabelText("someone else")).toHaveTextContent("another annotation");

        fireEvent.click(
            screen.getByRole("button", { name: firstEventTaskCategory.eventTaskDisplayName }),
        );

        expect(screen.queryByLabelText("suspense date")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("approver")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("resourcer")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("someone")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("someone else")).not.toBeInTheDocument();
    });

    it("submits comment", async () => {
        await renderEventTasks({ eventTasks: [eventTask] });
        fireEvent.click(
            screen.getByRole("button", { name: firstEventTaskCategory.eventTaskDisplayName }),
        );
        const inputBox = screen.getByPlaceholderText("Add a comment...");
        const commentAnnotation = "this is my very first comment";
        fireEvent.change(inputBox, {
            target: { value: commentAnnotation },
        });
        expect((inputBox as HTMLFormElement).value).toEqual(commentAnnotation.toString());
        fireEvent.submit(screen.getByTitle("commentForm"));
        td.verify(
            mockAddComment(eventTask.eventTaskId, {
                eventTaskId: eventTask.eventTaskId,
                annotation: commentAnnotation,
            }),
            { times: 1 },
        );
    });

    // TODO: edit suspense date...
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("updates task suspense date", async () => {
        const updatedEventTask = { ...eventTask, suspenseDate: "2020-08-16T00:00:01" };
        td.when(mockUpdateEventTaskSuspense(1, 1, "2020-08-17T00:00:01")).thenResolve(
            updatedEventTask,
        );
        const result = await renderEventTasks({ eventTasks: [eventTask] });
        fireEvent.click(screen.getByRole("button", { name: "edit task" }));
        datePickerNextDay(result, "suspense date");
        await fireEvent.submit(screen.getByRole("form", { name: "taskForm" }));
        expect(screen.getByLabelText("suspense date")).toHaveTextContent(
            /(Sun|Mon) Aug (16|17), 2020/,
        );
    });

    describe("websockets", () => {
        it("adds new events tasks in order", async () => {
            const fakeStompSocketService = mockSocketService();
            const result = await renderEventTasks({
                eventTasks: [eventTask],
                fakeStompSocketService,
            });
            const subscriptionId = fakeStompSocketService.findSubscription(
                `${SocketSubscriptionTopics.TASK_CREATED}${tsrEvent.eventId}`,
            ).subscription.id;

            const socketTask = makeEventTask({
                eventId: tsrEvent.eventId,
                eventTaskCategory: makeEventTaskCategory({
                    eventTaskCategoryId: 55,
                    eventTaskDisplayName: "socket task",
                }),
                status: makeEventTaskStatus({
                    sortOrder: 1,
                }),
            });
            expect(screen.queryByTestId("task-1")).toBeInTheDocument();
            expect(screen.queryByTestId("task-55")).not.toBeInTheDocument();
            act(() => {
                callSocketSubscriptionHandler(
                    fakeStompSocketService,
                    `${SocketSubscriptionTopics.TASK_CREATED}${tsrEvent.eventId}`,
                    subscriptionId,
                    socketTask,
                );
            });
            await reRender();
            expect(screen.queryByTestId("task-1")).toBeInTheDocument();
            expect(screen.queryByTestId("task-55")).toBeInTheDocument();
            expect(result.container).toHaveTextContent(/.*socket task.*task 1.*/);
        });

        it("adds comments to event task", async () => {
            const fakeStompSocketService = mockSocketService();
            await renderEventTasks({ fakeStompSocketService, eventTasks: [eventTask] });
            const socketComment = makeEventTaskComment({
                commentId: 1,
                eventTaskId: eventTask.eventTaskId,
                annotation: "my very first comment",
            });
            expect(screen.queryByText("my very first comment")).not.toBeInTheDocument();
            const subscriptionId = fakeStompSocketService.findSubscription(
                `${SocketSubscriptionTopics.TASK_COMMENT_CREATED}${tsrEvent.eventId}`,
            ).subscription.id;
            act(() => {
                callSocketSubscriptionHandler(
                    fakeStompSocketService,
                    `${SocketSubscriptionTopics.TASK_COMMENT_CREATED}${tsrEvent.eventId}`,
                    subscriptionId,
                    socketComment,
                );
            });
            await reRender();
            expect(screen.queryByText("my very first comment")).not.toBeInTheDocument();
            fireEvent.click(
                screen.getByRole("button", { name: firstEventTaskCategory.eventTaskDisplayName }),
            );
            expect(screen.queryByText("my very first comment")).toBeInTheDocument();
        });
    });

    interface RenderEventTasksProps {
        eventTasks?: EventTask[];
        fakeStompSocketService?: SocketService;
    }

    const renderEventTasks = async ({
        eventTasks = [],
        fakeStompSocketService = mockSocketService(),
    }: RenderEventTasksProps): Promise<RenderResult> => {
        td.when(mockGetEventTasks(tsrEvent.eventId)).thenResolve(eventTasks);
        td.when(mockGetEventTaskCategories(td.matchers.anything())).thenResolve(
            makePage({
                items: [
                    firstEventTaskCategory,
                    {
                        eventTaskId: 2,
                        eventTaskName: "task 2",
                        eventTaskDisplayName: "task 2",
                    },
                ],
            }) as PageDTO<EventTaskCategory>,
        );
        const socketProps = {
            inputSocketService: fakeStompSocketService,
        };
        const result = render(
            <StompSocketProvider {...socketProps}>
                <EventTaskSection tsrEvent={tsrEvent} />
            </StompSocketProvider>,
        );
        await reRender();
        return result;
    };
});
