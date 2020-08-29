import React, { ReactElement, useEffect, useState } from "react";
import { getAllEvents, TsrEvent } from "./EventApi";
import "./EventsSection.css";

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
                    <div className={"EventsSection-SingleEvent"} key={e.eventId}>
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
                {showEvents()}
            </div>
            <div className={"EventsSection-Events"}>
                <h2>My Organization Events</h2>
            </div>
        </div>
    );
};
