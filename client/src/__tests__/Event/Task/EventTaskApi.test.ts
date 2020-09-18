import nock from "nock";
import axios from "axios";
import {
    EventTaskCategory,
    getEventTaskCategoriesContains,
} from "../../../Event/Task/EventTaskApi";
import { makePage } from "../../TestHelpers";
import { HttpStatus } from "../../../api";

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
});
