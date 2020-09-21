import "mutationobserver-shim";
import React from "react";
import td from "testdouble";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { EventTaskSection } from "../../../Event/Task/EventTaskSection";
import * as EventTaskApi from "../../../Event/Task/EventTaskApi";
import { EventTask, EventTaskCategory } from "../../../Event/Task/EventTaskApi";
import selectEvent from "react-select-event";
import { TsrEvent } from "../../../Event/EventApi";
import {
    makeEvent,
    makeEventTask,
    makeEventTaskCategory,
    makeEventTaskStatus,
    makePage,
    reRender,
} from "../../TestHelpers";
import { PageDTO } from "../../../api";

describe("event tasks", () => {
    let mockGetEventTaskCategories: typeof EventTaskApi.getEventTaskCategoriesContains;
    let mockCreateEventTask: typeof EventTaskApi.createEventTask;
    let mockGetEventTasks: typeof EventTaskApi.getEventTasks;
    let tsrEvent: TsrEvent;
    let firstEventTaskCategory: EventTaskCategory;
    let eventTask: EventTask;

    beforeEach(() => {
        mockGetEventTaskCategories = td.replace(EventTaskApi, "getEventTaskCategoriesContains");
        mockCreateEventTask = td.replace(EventTaskApi, "createEventTask");
        mockGetEventTasks = td.replace(EventTaskApi, "getEventTasks");
        tsrEvent = makeEvent({ eventId: 1 });
        firstEventTaskCategory = makeEventTaskCategory({
            eventTaskId: 1,
            eventTaskDisplayName: "task 1",
        });
        eventTask = makeEventTask({
            eventTaskCategory: firstEventTaskCategory,
            eventId: tsrEvent.eventId,
            status: makeEventTaskStatus({ sortOrder: 1 }),
        });
    });

    afterEach(td.reset);

    it("create a task creates a task", async () => {
        await renderEventTasks({});
        td.when(mockCreateEventTask(tsrEvent.eventId, firstEventTaskCategory)).thenResolve(
            eventTask,
        );
        await selectEvent.select(screen.getByLabelText("add a task"), "task 1");
        expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();
        await act(async () => {
            await fireEvent.click(screen.getByRole("button", { name: "add task" }));
        });
        expect(screen.getByTestId("task-1")).toBeInTheDocument();
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

    interface RenderEventTasksProps {
        eventTasks?: EventTask[];
    }

    const renderEventTasks = async ({
        eventTasks = [],
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
        const result = render(<EventTaskSection tsrEvent={tsrEvent} />);
        await reRender();
        return result;
    };
});
