import React, { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById, TsrEvent } from "./EventApi";
import moment, { Moment } from "moment";
import { currentTime, userTimeZone } from "../api";
import { start } from "repl";

interface RouteParams {
    eventId: string;
}

const SHORT_DATE_FORMAT = "M/D/YY";
const LONG_DATE_FORMAT = "ddd MMM D, YYYY";
const LONG_DATE_TIME_FORMAT = "dddd, MMMM Do YYYY, HHmm";

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
    }, [setTsrEvent]);

    if (!tsrEvent) return <></>;
    const startDate = moment(tsrEvent.startDate);
    const endDate = moment(tsrEvent.endDate);

    const headerEventName = (): string => {
        if (tsrEvent.eventName === "") {
            return "event details";
        } else {
            return tsrEvent.eventName + " details";
        }
    };

    const headerDates = (): string => {
        if (startDate.isSame(endDate)) {
            return startDate.format(LONG_DATE_FORMAT);
        } else {
            return `${startDate.format(LONG_DATE_FORMAT)} - ${endDate.format(LONG_DATE_FORMAT)}`;
        }
    };

    const longDateFormat = (date: Moment): string =>
        `${date.format(LONG_DATE_TIME_FORMAT)} (${userTimeZone()})`;

    const startEndDate = (): ReactElement => {
        if (startDate.isSame(endDate)) {
            return <span>{`date: ${longDateFormat(startDate)}`}</span>;
        } else {
            return (
                <>
                    <span>{`start date: ${longDateFormat(startDate)}`}</span>
                    <span>{`end date: ${longDateFormat(endDate)}`}</span>
                </>
            );
        }
    };

    const dateLastModifiedFormat = (date: Moment): string => {
        const diffMoment = moment.duration(currentTime().diff(date));
        let numOfTime = 0;
        let unitOfTime = "";
        if (diffMoment.days() > 0) {
            numOfTime = diffMoment.days();
            unitOfTime = " day";
        } else if (diffMoment.hours() > 0) {
            numOfTime = diffMoment.hours();
            unitOfTime = " hour";
        } else if (diffMoment.minutes() > 5) {
            numOfTime = diffMoment.minutes();
            unitOfTime = " minute";
        } else {
            return "just now...";
        }
        if (numOfTime > 1) {
            unitOfTime = unitOfTime + "s";
        }
        return numOfTime + unitOfTime + " ago";
    };

    return (
        <>
            <h1>{headerEventName()}</h1>
            <h2>{headerDates()}</h2>
            <span>
                {tsrEvent.eventType ? `type: ${tsrEvent.eventType.displayName}` : "type: none"}
            </span>
            {startEndDate()}
            <span>{"organization: " + tsrEvent.organization}</span>
            <span>
                {`created by ${tsrEvent.createdBy} (${moment(tsrEvent.createdDate).format(
                    SHORT_DATE_FORMAT,
                )})`}
            </span>
            <span>{`last modified by ${tsrEvent.lastModifiedBy} ${dateLastModifiedFormat(
                moment(tsrEvent.lastModifiedDate),
            )}`}</span>
        </>
    );
};
