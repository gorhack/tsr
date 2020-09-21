import nock from "nock";
import axios from "axios";
import {
    createEventTask,
    EventTask,
    EventTaskCategory,
    getEventTaskCategoriesContains,
    getEventTasks,
    StatusCode,
} from "../../../Event/Task/EventTaskApi";
import { makePage, NockBody } from "../../TestHelpers";
import { HttpStatus } from "../../../api";
import { TsrUser } from "../../../Users/UserApi";

describe("event task", () => {
    axios.defaults.baseURL = "http://example.com";
    let eventTaskCategory: EventTaskCategory;
    let user: TsrUser;
    let eventTask: EventTask;

    beforeEach(() => {
        eventTaskCategory = {
            eventTaskId: 1,
            eventTaskDisplayName: "first",
            eventTaskName: "FIRST",
        };
        user = {
            userId: "1234",
            username: "user",
            role: "USER",
            settings: {
                organizations: [],
            },
        };
        eventTask = {
            eventTaskCategory: eventTaskCategory,
            eventId: 1,
            suspenseDate: "2020-08-18T14:15:59",
            approver: user,
            resourcer: user,
            status: {
                statusId: 1,
                statusDisplayName: "created",
                statusName: "CREATED",
                statusShortName: StatusCode.R,
                sortOrder: 2,
            },
        };
    });

    it("gets event task categories", async () => {
        const eventTaskCategories: EventTaskCategory[] = [
            eventTaskCategory,
            {
                eventTaskId: 2,
                eventTaskDisplayName: "second",
                eventTaskName: "SECOND",
            },
        ];
        const eventTaskPage = makePage({ items: eventTaskCategories });
        nock("http://example.com")
            .get("/api/v1/event/task/category/search?searchTerm=")
            .reply(HttpStatus.OK, eventTaskPage);
        const response = await getEventTaskCategoriesContains("");
        expect(response).toEqual(eventTaskPage);
    });

    it("creates an event task", async () => {
        nock("http://example.com")
            .post("/api/v1/event/1/task", eventTaskCategory as NockBody)
            .reply(HttpStatus.CREATED, eventTask);
        const response = await createEventTask(1, eventTaskCategory);
        expect(eventTask).toEqual(response);
    });

    it("gets event tasks", async () => {
        const expectedResponse: EventTask[] = [
            eventTask,
            {
                eventTaskCategory: {
                    eventTaskId: 2,
                    eventTaskDisplayName: "second",
                    eventTaskName: "SECOND",
                },
                eventId: 1,
                suspenseDate: "2020-08-18T14:15:59",
                approver: user,
                resourcer: user,
                status: {
                    statusId: 1,
                    statusDisplayName: "created",
                    statusName: "CREATED",
                    statusShortName: StatusCode.R,
                    sortOrder: 2,
                },
            },
        ];
        nock("http://example.com")
            .get("/api/v1/event/1/task")
            .reply(HttpStatus.OK, expectedResponse);
        const response = await getEventTasks(1);
        expect(expectedResponse).toEqual(response);
    });
});
