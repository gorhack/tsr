import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { EventsSection } from "./Event/EventsSection";
import { getUserInfo, TsrUser } from "./Users/UserApi";
import { useStompSocketContext } from "./StompSocketContext";
import { SocketStatus } from "./SocketService";
import { IMessage } from "@stomp/stompjs";
import { SocketSubscriptionTopics, TsrEvent } from "./Event/EventApi";

export const Home: React.FC = () => {
    const { socketService } = useStompSocketContext();
    const history = useHistory();
    const [tsrUser, setTsrUser] = useState<TsrUser>({
        userId: "",
        username: "",
        role: "USER",
    });

    useEffect((): void => {
        (async (): Promise<void> => {
            try {
                const user = await getUserInfo();
                setTsrUser(user);
            } catch (e) {
                console.error(`error retrieving user, ${e.message.error}`);
            }
        })();
    }, [setTsrUser]);

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
            <h1>TSR</h1>
            <div>
                <div>{tsrUser.userId}</div>
                <div>{tsrUser.username}</div>
            </div>
            <button className={"basic-button"} onClick={() => history.push("/createEvent")}>
                Create an Event
            </button>
            <EventsSection user={tsrUser} />
        </>
    );
};
