import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { EventsSection } from "./Event/EventsSection";
import { useStompSocketContext } from "./StompSocketContext";
import { SocketStatus } from "./SocketService";
import { IMessage } from "@stomp/stompjs";
import { SocketSubscriptionTopics, TsrEvent } from "./Event/EventApi";
import { PrimaryButton } from "./Buttons/Buttons";
import "./Home.css";
import { emptyTsrUser, getUserInfo, TsrUser } from "./Users/UserApi";

export const Home: React.FC = () => {
    const { socketService } = useStompSocketContext();
    const [tsrUser, setTsrUser] = useState<TsrUser>(emptyTsrUser);
    const history = useHistory();

    useEffect(() => {
        (async () => {
            await getUserInfo()
                .then((result) => {
                    setTsrUser(result);
                })
                .catch((error) => {
                    console.error(`unable to get current user ${error.message}`);
                });
        })();
    }, [setTsrUser]);

    useEffect(() => {
        if (socketService.status !== SocketStatus.CONNECTED || tsrUser.userId.length === 0) {
            return;
        }
        tsrUser.settings.organizations.forEach((org) => {
            socketService.subscribe({
                topic: `${SocketSubscriptionTopics.EVENT_CREATED}${org.organizationId}`,
                handler: (msg: IMessage): void => {
                    const message: TsrEvent = JSON.parse(msg.body);
                    if (message.audit.createdBy !== tsrUser.userId) {
                        window.alert(
                            `new event has been created in your organization\n${message.eventName}\nrefresh the page`,
                        );
                    }
                },
            });
        });
        return () => {
            tsrUser.settings.organizations
                .map(
                    (org) =>
                        socketService.findSubscriptionWithoutError(
                            `${SocketSubscriptionTopics.EVENT_CREATED}${org.organizationId}`,
                        )?.subscription.id,
                )
                .forEach((sub) => {
                    if (sub) {
                        socketService.unsubscribe(sub);
                    }
                });
        };
    }, [socketService, tsrUser]);

    return (
        <>
            <div className="Home-Header flex-row">
                <h1>events</h1>
                <PrimaryButton
                    className={"CreateEvent-Button"}
                    onClick={() => history.push("/createEvent")}
                >
                    Create an Event
                </PrimaryButton>
            </div>
            <div className="space-2" />
            <EventsSection />
        </>
    );
};
