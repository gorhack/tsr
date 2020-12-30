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
    updateEventTaskSuspense,
} from "../../../Event/Task/EventTaskApi";
import { makePage, NockBody } from "../../TestHelpers";
import { HttpStatus } from "../../../api";
import { TsrUser } from "../../../Users/UserApi";

describe("event task", () => {
    const BASE_URL = "http://example.com";
    const SUSPENSE_DATE = "2020-08-18T14:15:59";
    axios.defaults.baseURL = BASE_URL;
    let eventTaskCategory: EventTaskCategory;
    let user: TsrUser;
    let eventTask: EventTask;

    beforeEach(() => {
        eventTaskCategory = {
            eventTaskCategoryId: 1,
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
            suspenseDate: SUSPENSE_DATE,
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
                eventTaskCategoryId: 2,
                eventTaskDisplayName: "second",
                eventTaskName: "SECOND",
            },
        ];
        const eventTaskPage = makePage({ items: eventTaskCategories });
        nock(BASE_URL)
            .get("/api/v1/event/task/category/search?searchTerm=")
            .reply(HttpStatus.OK, eventTaskPage);
        const response = await getEventTaskCategoriesContains("");
        expect(response).toEqual(eventTaskPage);
    });

    it("creates an event task", async () => {
        nock(BASE_URL)
            .post("/api/v1/event/1/task", eventTaskCategory as NockBody)
            .reply(HttpStatus.CREATED, eventTask);
        const response = await createEventTask(1, eventTaskCategory);
        expect(eventTask).toEqual(response);
    });

    it("updates an event task suspense", async () => {
        nock(BASE_URL)
            .put("/api/v1/event/1/task/4/suspense", { suspenseDate: SUSPENSE_DATE })
            .reply(HttpStatus.OK, eventTask);
        const response = await updateEventTaskSuspense(1, 4, SUSPENSE_DATE);
        expect(eventTask).toEqual(response);
    });

    it("gets event tasks", async () => {
        const expectedResponse: EventTask[] = [
            eventTask,
            {
                eventTaskId: 2,
                eventTaskCategory: {
                    eventTaskCategoryId: 2,
                    eventTaskDisplayName: "second",
                    eventTaskName: "SECOND",
                },
                eventId: 1,
                suspenseDate: SUSPENSE_DATE,
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
        nock(BASE_URL).get("/api/v1/event/1/task").reply(HttpStatus.OK, expectedResponse);
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
                createdDate: SUSPENSE_DATE,
                lastModifiedBy: "1234",
                lastModifiedByDisplayName: "user",
                lastModifiedDate: SUSPENSE_DATE,
            },
        };
        nock(BASE_URL)
            .post("/api/v1/event/1/task/10/comment", comment as NockBody)
            .reply(HttpStatus.CREATED, expectedResponse);
        const response = await addComment(1, comment);
        expect(expectedResponse).toEqual(response);
    });

    it("creates an event task category", async () => {
        const createdEventTaskCategory: EventTaskCategory = {
            eventTaskCategoryId: 1,
            eventTaskDisplayName: "first",
            eventTaskName: "first",
        };
        const eventTaskCategoryToCreate = {
            eventTaskCategoryId: 0,
            eventTaskDisplayName: "first",
            eventTaskName: "first",
        };
        nock(BASE_URL)
            .post("/api/v1/event/task/category", eventTaskCategoryToCreate)
            .reply(HttpStatus.CREATED, createdEventTaskCategory);
        const response = await createEventTaskCategory(eventTaskCategoryToCreate);
        expect(response).toEqual(createdEventTaskCategory);
    });
});
