import React, { ReactElement } from "react";
import moment, { Moment } from "moment";
import { TsrEvent } from "./EventApi";
import { currentTime, userTimeZone } from "../api";

const SHORT_DATE_FORMAT = "M/D/YY";
const LONG_DATE_TIME_FORMAT = "dddd, MMMM Do YYYY, HHmm";

interface EventDetailsProps {
    tsrEvent: TsrEvent;
}

export const EventDetails = React.memo(
    ({ tsrEvent }: EventDetailsProps): ReactElement => {
        const startEndDate = (startDate: Moment, endDate: Moment): ReactElement => {
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

        const longDateFormat = (date: Moment): string =>
            `${date.format(LONG_DATE_TIME_FORMAT)} (${userTimeZone()})`;

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
                <span>
                    {tsrEvent.eventType ? `type: ${tsrEvent.eventType.displayName}` : "type: none"}
                </span>
                {startEndDate(moment(tsrEvent.startDate), moment(tsrEvent.endDate))}
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
    },
);

EventDetails.displayName = "EventDetails";
