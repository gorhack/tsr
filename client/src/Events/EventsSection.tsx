import React, { ReactElement, useEffect, useState } from "react";
import { getAllEvents, TsrEvent } from "./EventApi";
import "./EventsSection.css";
import { TsrUser } from "../Users/UserApi";
import { useHistory } from "react-router-dom";
import { emptyPage, PageDTO } from "../api";

interface EventsSectionProps {
    user: TsrUser;
}

export const EventsSection = ({ user }: EventsSectionProps): ReactElement => {
    const [eventList, setEventList] = useState<PageDTO<TsrEvent>>(emptyPage);

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
                {eventList.items
                    .filter((e) => e.audit.createdBy === user.userId)
                    .map((e) => (
                        <SingleEvent key={`key-${e.eventId}`} event={e} dataTestId="user-event" />
                    ))}
            </>
        );
    };

    // TODO add filter by user org
    const showOrgEvents = (): ReactElement => {
        return (
            <>
                {eventList.items
                    .filter((e) => e.audit.createdBy !== user.userId)
                    .map((e) => (
                        <SingleEvent key={`key-${e.eventId}`} event={e} dataTestId="org-event" />
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

interface SingleEventProps {
    event: TsrEvent;
    className?: string;
    dataTestId?: string;
}

const SingleEvent = ({ event, className, dataTestId }: SingleEventProps): ReactElement => {
    const history = useHistory();
    return (
        <div
            className={"EventsSection-SingleEvent " + className}
            data-testid={`${dataTestId}-${event.eventId}`}
            onClick={() => history.push(`/event/${event.eventId}`)}
        >
            {event.eventName}
        </div>
    );
};
