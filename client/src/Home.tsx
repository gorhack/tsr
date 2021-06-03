import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { EventsSection } from "./Event/EventsSection";
import { useStompSocketContext } from "./StompSocketContext";
import { SocketStatus } from "./SocketService";
import { IMessage } from "@stomp/stompjs";
import { SocketSubscriptionTopics, TsrEvent } from "./Event/EventApi";
import { PrimaryButton } from "./Buttons/Buttons";
import "./Home.css";
import UserContext from "./Users/UserContext";

export const Home: React.FC = () => {
    const { socketService } = useStompSocketContext();
    const tsrUser = useContext(UserContext);
    const history = useHistory();

    useEffect(() => {
        if (tsrUser === undefined) {
            return;
        }
    }, [tsrUser]);

    useEffect(() => {
        if (tsrUser === undefined) {
            return;
        }

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

    if (tsrUser === undefined) {
        return <></>;
    }

    return (
        <>
            <div className="Home-Header flex-row-wrap">
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
