import React, { ReactElement, useEffect, useState } from "react";
import { getAllEvents, TsrEvent } from "./EventApi";
import "./EventsSection.css";
import { TsrUser } from "../Users/UserApi";

interface EventsSectionProps {
    user: TsrUser;
}

export const EventsSection = ({ user }: EventsSectionProps): ReactElement => {
    const [eventList, setEventList] = useState<TsrEvent[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const newEventList = await getAllEvents();
                setEventList(newEventList);
            } catch (e) {
                console.error(`Error getting all events. ${e.message.error}`);
            }
        })();
    }, [setEventList]);

    const showMyEvents = (): ReactElement => {
        return (
            <>
                {eventList
                    .filter((e) => e.audit.createdBy === user.userId)
                    .map((e) => (
                        <div
                            key={e.eventId}
                            className={"EventsSection-SingleEvent"}
                            data-testid={`user-event-${e.eventId}`}
                        >
                            {e.eventName}
                        </div>
                    ))}
            </>
        );
    };

    const showOrgEvents = (): ReactElement => {
        return (
            <>
                {eventList
                    .filter((e) => e.audit.createdBy !== user.userId)
                    .map((e) => (
                        <div
                            key={e.eventId}
                            className={"EventsSection-SingleEvent"}
                            data-testid={`org-event-${e.eventId}`}
                        >
                            {e.eventName}
                        </div>
                    ))}
            </>
        );
    };

    return (
        <div className={"EventsSection-Content"}>
            <div className={"EventsSection-Events"}>
                <h2>My Created Events</h2>
                {showMyEvents()}
            </div>
            <div className={"EventsSection-Events"}>
                <h2>My Organization Events</h2>
                {showOrgEvents()}
            </div>
        </div>
    );
};
