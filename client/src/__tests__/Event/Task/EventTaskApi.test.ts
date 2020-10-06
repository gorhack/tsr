import nock from "nock";
import axios from "axios";
import {
    addComment,
    createEventTask,
    createEventTaskCategory,
    EventTask,
    EventTaskCategory,
    EventTaskComment,
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
            eventTaskId: 4,
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
            comments: [],
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
                eventTaskId: 2,
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
                comments: [],
            },
        ];
        nock("http://example.com")
            .get("/api/v1/event/1/task")
            .reply(HttpStatus.OK, expectedResponse);
        const response = await getEventTasks(1);
        expect(expectedResponse).toEqual(response);
    });

    it("posts a comment", async () => {
        const comment: EventTaskComment = {
            commentId: 1,
            eventTaskId: 10,
            annotation: "a comment",
        };
        const expectedResponse: EventTaskComment = {
            commentId: 1,
            eventTaskId: 10,
            annotation: "a comment",
            audit: {
                createdBy: "1234",
                createdByDisplayName: "user",
                createdDate: "2020-08-18T14:15:59",
                lastModifiedBy: "1234",
                lastModifiedByDisplayName: "user",
                lastModifiedDate: "2020-08-18T14:15:59",
            },
        };
        nock("http://example.com")
            .post("/api/v1/event/1/task/10/comment", comment as NockBody)
            .reply(HttpStatus.CREATED, expectedResponse);
        const response = await addComment(1, comment);
        expect(expectedResponse).toEqual(response);
    });

    it("creates an event task category", async () => {
        const createdEventTaskCategory: EventTaskCategory = {
            eventTaskId: 1,
            eventTaskDisplayName: "first",
            eventTaskName: "first",
        };
        const eventTaskCategoryToCreate = {
            eventTaskId: 0,
            eventTaskDisplayName: "first",
            eventTaskName: "first",
        };
        nock("http://example.com")
            .post("/api/v1/event/task/category", eventTaskCategoryToCreate)
            .reply(HttpStatus.CREATED, createdEventTaskCategory);
        const response = await createEventTaskCategory(eventTaskCategoryToCreate);
        expect(response).toEqual(createdEventTaskCategory);
    });
});
