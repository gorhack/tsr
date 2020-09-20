import "mutationobserver-shim";
import React from "react";
import td from "testdouble";
import { act, fireEvent, render, RenderResult, screen } from "@testing-library/react";
import { EventTaskSection } from "../../../Event/Task/EventTaskSection";
import * as EventTaskApi from "../../../Event/Task/EventTaskApi";
import { CreateEventTask, EventTaskCategory, StatusCode } from "../../../Event/Task/EventTaskApi";
import selectEvent from "react-select-event";
import { TsrEvent } from "../../../Event/EventApi";
import { makeEvent, makePage, reRender } from "../../TestHelpers";
import { PageDTO } from "../../../api";
import { TsrUser } from "../../../Users/UserApi";

describe("event tasks", () => {
    let mockGetEventTaskCategories: typeof EventTaskApi.getEventTaskCategoriesContains;
    let mockCreateEventTask: typeof EventTaskApi.createEventTask;
    let tsrEvent: TsrEvent;
    let firstEventTaskCategory: EventTaskCategory;

    beforeEach(() => {
        mockGetEventTaskCategories = td.replace(EventTaskApi, "getEventTaskCategoriesContains");
        mockCreateEventTask = td.replace(EventTaskApi, "createEventTask");
        tsrEvent = makeEvent({ eventId: 1 });
        firstEventTaskCategory = {
            eventTaskId: 1,
            eventTaskName: "task 1",
            eventTaskDisplayName: "task 1",
        };
    });

    afterEach(td.reset);

    it("create a task creates a task", async () => {
        await renderEventTasks();
        const user: TsrUser = {
            userId: "1234",
            username: "user",
            role: "USER",
            settings: {
                organizations: [],
            },
        };
        const creatableEventTask: CreateEventTask = {
            eventId: tsrEvent.eventId,
            eventTaskCategory: firstEventTaskCategory,
        };
        td.when(mockCreateEventTask(creatableEventTask)).thenResolve({
            eventTaskCategory: firstEventTaskCategory,
            eventId: tsrEvent.eventId,
            suspenseDate: "2020-08-18T14:15:59",
            approver: user,
            resourcer: user,
            status: {
                statusId: 1,
                statusDisplayName: "created",
                statusName: "CREATED",
                statusShortName: StatusCode.R,
            },
        });
        await selectEvent.select(screen.getByLabelText("add a task"), "task 1");
        expect(screen.queryByTestId("task-1")).not.toBeInTheDocument();
        await act(async () => {
            await fireEvent.click(screen.getByRole("button", { name: "add task" }));
        });
        expect(screen.getByTestId("task-1")).toBeInTheDocument();
    });

    const renderEventTasks = async (): Promise<RenderResult> => {
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
