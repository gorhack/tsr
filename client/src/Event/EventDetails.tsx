import React, { ReactElement } from "react";
import moment, { Moment } from "moment";
import { TsrEvent } from "./EventApi";
import { currentTimeUtc, userTimeZone } from "../api";
import "./EventPage.css";
import { DetailRow } from "./DetailRow";

const SHORT_DATE_FORMAT = "M/D/YY";
const LONG_DATE_TIME_FORMAT = "dddd, MMMM Do YYYY, HHmm";

interface EventDetailsProps {
    tsrEvent: TsrEvent;
}

export const EventDetails = React.memo(
    ({ tsrEvent }: EventDetailsProps): ReactElement => {
        const startEndDate = (startDate: Moment, endDate: Moment): ReactElement => {
            if (startDate.isSame(endDate)) {
                return <DetailRow label="Date" description={longDateFormat(startDate)} />;
            } else {
                return (
                    <>
                        <DetailRow label="Start Date" description={longDateFormat(startDate)} />
                        <DetailRow label="End Date" description={longDateFormat(endDate)} />
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
                unitOfTime = "day";
            } else if (diffMoment.hours() > 0) {
                numOfTime = diffMoment.hours();
                unitOfTime = "hour";
            } else if (diffMoment.minutes() > 5) {
                numOfTime = diffMoment.minutes();
                unitOfTime = "minute";
            } else {
                return "just now...";
            }
            if (numOfTime > 1) {
                unitOfTime = `${unitOfTime}s`;
            }
            return `${numOfTime} ${unitOfTime} ago`;
        };

        const mapOrganizations = () => {
            const orgArray = tsrEvent.organizations.map((org) => org.organizationDisplayName);
            return orgArray.join("; ");
        };

        return (
            <>
                <DetailRow
                    label="Event Type"
                    description={
                        tsrEvent.eventType
                            ? tsrEvent.eventType.displayName.charAt(0).toUpperCase() +
                              tsrEvent.eventType.displayName.slice(1)
                            : "No Event Type"
                    }
                />
                {startEndDate(moment.utc(tsrEvent.startDate), moment.utc(tsrEvent.endDate))}
                <DetailRow label="Organization" description={mapOrganizations()} />
                <DetailRow
                    label="Event Created By"
                    description={`${tsrEvent.audit.createdByDisplayName}, (${moment
                        .utc(tsrEvent.audit.createdDate)
                        .local()
                        .format(SHORT_DATE_FORMAT)})`}
                />
                <DetailRow
                    label="Last Modified By"
                    description={`${
                        tsrEvent.audit.lastModifiedByDisplayName
                    }, ${dateLastModifiedFormat(moment(tsrEvent.audit.lastModifiedDate))}`}
                />
            </>
        );
    },
);

EventDetails.displayName = "EventDetails";
