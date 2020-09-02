import React, { ReactElement } from "react";
import moment, { Moment } from "moment";
import { TsrEvent } from "./EventApi";
import { currentTimeUtc, userTimeZone } from "../api";
import "./EventDetails.css";

const SHORT_DATE_FORMAT = "M/D/YY";
const LONG_DATE_TIME_FORMAT = "dddd, MMMM Do YYYY, HHmm";

interface EventDetailsProps {
    tsrEvent: TsrEvent;
}

export const EventDetails = React.memo(
    ({ tsrEvent }: EventDetailsProps): ReactElement => {
        const startEndDate = (startDate: Moment, endDate: Moment): ReactElement => {
            if (startDate.isSame(endDate)) {
                return (
                    <div>
                        <dt>Date</dt>
                        <dd>{longDateFormat(startDate)}</dd>
                    </div>
                );
            } else {
                return (
                    <>
                        <div>
                            <dt>Start Date</dt>
                            <dd>{longDateFormat(startDate)}</dd>
                        </div>
                        <div>
                            <dt>End Date</dt>
                            <dd>{longDateFormat(endDate)}</dd>
                        </div>
                    </>
                );
            }
        };

        const longDateFormat = (date: Moment): string =>
            `${date.local().format(LONG_DATE_TIME_FORMAT)} (${userTimeZone()})`;

        const dateLastModifiedFormat = (dateLastModified: Moment): string => {
            const diffMoment = moment.duration(currentTimeUtc().diff(dateLastModified));
            let numOfTime = 0;
            let unitOfTime = "";
            if (diffMoment.days() >= 7) {
                return dateLastModified.format(SHORT_DATE_FORMAT);
            } else if (diffMoment.days() > 0) {
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
            <div className={"EventDetails-Container"}>
                <dl>
                    <div>
                        <dt>Event Type</dt>
                        <dd>
                            {tsrEvent.eventType ? tsrEvent.eventType.displayName : "No Event Type"}
                        </dd>
                    </div>
                    {startEndDate(moment.utc(tsrEvent.startDate), moment.utc(tsrEvent.endDate))}
                    <div>
                        <dt>Organization</dt>
                        <dd>{tsrEvent.organization}</dd>
                    </div>
                    <div>
                        <dt>Event Created By</dt>
                        <dd>
                            {`${tsrEvent.audit.createdByDisplayName}, (${moment
                                .utc(tsrEvent.audit.createdDate)
                                .local()
                                .format(SHORT_DATE_FORMAT)})`}
                        </dd>
                    </div>
                    <div>
                        <dt>Last Modified By</dt>
                        <dd>{`${tsrEvent.audit.lastModifiedByDisplayName}, ${dateLastModifiedFormat(
                            moment(tsrEvent.audit.lastModifiedDate),
                        )}`}</dd>
                    </div>
                </dl>
            </div>
        );
    },
);

EventDetails.displayName = "EventDetails";
