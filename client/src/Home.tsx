import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { EventsSection } from "./Event/EventsSection";
import { useStompSocketContext } from "./StompSocketContext";
import { SocketStatus } from "./SocketService";
import { IMessage } from "@stomp/stompjs";
import { SocketSubscriptionTopics, TsrEvent } from "./Event/EventApi";

export const Home: React.FC = () => {
    const { socketService } = useStompSocketContext();
    const history = useHistory();

    useEffect(() => {
        if (socketService.status !== SocketStatus.CONNECTED) {
            return;
        }
        // TODO set as the user's org(s)
        socketService.subscribe({
            topic: `${SocketSubscriptionTopics.EVENT_CREATED}-1`,
            handler: (msg: IMessage): void => {
                const message: TsrEvent = JSON.parse(msg.body);
                window.alert(
                    `new event has been created in your organization\n${message.eventName}\nrefresh the page`,
                );
            },
        });
    }, [socketService]);

    return (
        <>
            <button className={"basic-button"} onClick={() => history.push("/createEvent")}>
                Create an Event
            </button>
            <EventsSection />
        </>
    );
};
