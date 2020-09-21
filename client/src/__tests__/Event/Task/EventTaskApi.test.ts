import nock from "nock";
import axios from "axios";
import {
    createEventTask,
    EventTask,
    EventTaskCategory,
    getEventTaskCategoriesContains,
    StatusCode,
} from "../../../Event/Task/EventTaskApi";
import { makePage, NockBody } from "../../TestHelpers";
import { HttpStatus } from "../../../api";
import { TsrUser } from "../../../Users/UserApi";

describe("event task", () => {
    axios.defaults.baseURL = "http://example.com";

    it("gets event task categories", async () => {
        const eventTaskCategories: EventTaskCategory[] = [
            {
                eventTaskId: 1,
                eventTaskDisplayName: "first",
                eventTaskName: "FIRST",
            },
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
        const eventTaskCategory = {
            eventTaskId: 1,
            eventTaskDisplayName: "Class I",
            eventTaskName: "CLASS_ONE",
        };
        const user: TsrUser = {
            userId: "1234",
            username: "user",
            role: "USER",
            settings: {
                organizations: [],
            },
        };
        const eventTask: EventTask = {
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
            },
        };
        nock("http://example.com")
            .post("/api/v1/event/1/task", eventTaskCategory as NockBody)
            .reply(HttpStatus.CREATED, eventTask);
        const response = await createEventTask(1, eventTaskCategory);
        expect(eventTask).toEqual(response);
    });
});
