import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById, TsrEvent } from "./EventApi";
import moment from "moment";
import { EventDetails } from "./EventDetails";

interface RouteParams {
    eventId: string;
}

const LONG_DATE_FORMAT = "ddd MMM D, YYYY";

export const EventPage: React.FC = () => {
    const { eventId } = useParams<RouteParams>();
    const [tsrEvent, setTsrEvent] = useState<TsrEvent | undefined>(undefined);

    useEffect(() => {
        (async () => {
            await getEventById(eventId ? +eventId : 0)
                .then((event) => {
                    setTsrEvent(event);
                })
                .catch((error) => {
                    console.error(`error getting event by id ${eventId}, ${error.message.value}`);
                });
        })();
    }, [eventId, setTsrEvent]);

    if (!tsrEvent) return <></>;
    const startDate = moment.utc(tsrEvent.startDate);
    const endDate = moment.utc(tsrEvent.endDate);

    const headerEventName = (): string => {
        if (tsrEvent.eventName === "") {
            return "event details";
        } else {
            return tsrEvent.eventName + " details";
        }
    };

    const headerDates = (): string => {
        if (startDate.isSame(endDate)) {
            return startDate.local().format(LONG_DATE_FORMAT);
        } else {
            return `${startDate.local().format(LONG_DATE_FORMAT)} - ${endDate.format(
                LONG_DATE_FORMAT,
            )}`;
        }
    };

    return (
        <>
            <h1>{headerEventName()}</h1>
            <h2>{headerDates()}</h2>
            <EventDetails tsrEvent={tsrEvent} />
        </>
    );
};
