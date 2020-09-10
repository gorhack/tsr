import { mockSocketService } from "./TestHelpers";
import td from "testdouble";
import { doNothing } from "../Helpers/Helpers";

describe("websocket connections", () => {
    it("does not subscribe to the same subscription request more than once", () => {
        const socketService = mockSocketService();

        socketService.subscribe({
            topic: "topic1",
            handler: doNothing,
            headers: { id: "topic1id" },
        });
        expect(socketService.subscriptions.length).toEqual(1);
        socketService.subscribe({
            topic: "topic1",
            handler: doNothing,
        });
        socketService.subscribe({
            topic: "topic1",
            handler: doNothing,
        });
        expect(socketService.subscriptions.length).toEqual(1);
    });
    it("adds subscriptions to queue when not ready to accept new subscriptions and then subscribes to all when ready", () => {
        const socketService = mockSocketService();

        const readyCall = td.replace(socketService, "ready");
        td.when(readyCall()).thenReturn(false, true);
        socketService.subscribe({
            topic: "topic1",
            handler: doNothing,
        });
        expect(socketService.subscriptions.length).toEqual(0);
        socketService.subscribe({
            topic: "topic2",
            handler: doNothing,
        });
        expect(socketService.subscriptions.length).toEqual(2);
    });
});
