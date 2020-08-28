import React, { ReactElement, useEffect, useState } from "react";
import { getAllEvents, TsrEvent } from "./EventApi";

export const EventsSection = (): ReactElement => {
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

    const showEvents = (): ReactElement => {
        return (
            <>
                {eventList.map((e) => (
                    <span key={e.eventId}>{e.eventName}</span>
                ))}
            </>
        );
    };

    return (
        <>
            <h1>Heading for Events</h1>
            {showEvents()}
        </>
    );
};
