import React, { ReactElement } from "react";
import { TsrEvent } from "./EventApi";
import { dateLastModifiedFormat, userTimeZone } from "../api";
import "./EventPage.css";
import { DetailRow } from "./DetailRow";

interface EventDetailsProps {
    tsrEvent: TsrEvent;
}

export const EventDetails = React.memo(({ tsrEvent }: EventDetailsProps): ReactElement => {
    const startEndDate = (startDate: Date, endDate: Date): ReactElement => {
        if (startDate.getTime() === endDate.getTime()) {
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

    const longDateFormat = (date: Date): string =>
        `${date.toLocaleString() + " - " + userTimeZone()}`;

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
            {startEndDate(tsrEvent.startDate, tsrEvent.endDate)}
            <DetailRow label="Organization" description={mapOrganizations()} />
            <DetailRow
                label="Event Created By"
                description={`${tsrEvent.audit.createdByDisplayName}, (${
                    new Date(tsrEvent.audit.createdDate).toLocaleString() + " - " + userTimeZone()
                })`}
            />
            <DetailRow
                label="Last Modified By"
                description={`${tsrEvent.audit.lastModifiedByDisplayName}, ${dateLastModifiedFormat(
                    new Date(tsrEvent.audit.lastModifiedDate),
                )}`}
            />
        </>
    );
});

EventDetails.displayName = "EventDetails";
