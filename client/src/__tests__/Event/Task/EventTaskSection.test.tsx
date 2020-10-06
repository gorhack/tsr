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
        firstEventTaskCategory = makeEventTaskCategory({
            eventTaskCategoryId: 1,
            eventTaskCategoryDisplayName: "task 1",
        });
        eventTask = {
            eventTaskId: 1,
            eventTaskCategory: firstEventTaskCategory,
            eventId: tsrEvent.eventId,
            suspenseDate: "2020-08-18T14:15:59",
            approver: makeTsrUser({ username: "approver user" }),
            resourcer: makeTsrUser({ username: "resourcer user" }),
            status: makeEventTaskStatus({ sortOrder: 2 }),
            comments: [],
        };
    });

    afterEach(td.reset);

    it("create a task creates a task", async () => {
        await renderEventTasks({});
        await selectEvent.select(screen.getByLabelText("add a task"), "task 1");
        expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();
        await act(async () => {
            await fireEvent.click(screen.getByRole("button", { name: "add task" }));
        });
        td.verify(mockCreateEventTask(tsrEvent.eventId, firstEventTaskCategory), { times: 1 });
    });

    it("shows tasks in order of status R->Y->G", async () => {
        const eventTasks: EventTask[] = [
            makeEventTask({
                eventId: 1,
                eventTaskCategory: makeEventTaskCategory({
                    eventTaskId: 3,
                    eventTaskDisplayName: "last task",
                }),
                status: makeEventTaskStatus({
                    sortOrder: 10,
                }),
            }),
            makeEventTask({
                eventId: 1,
                eventTaskCategory: makeEventTaskCategory({
                    eventTaskId: 2,
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
            /(Tue|Wed) Aug (18|19), 2020/,
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
                    eventTaskId: 55,
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
