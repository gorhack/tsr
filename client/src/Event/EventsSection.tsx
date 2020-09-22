import React, { ReactElement, useEffect, useState } from "react";
import { getActiveEventsByOrganizationIds, getActiveEventsByUserId, TsrEvent } from "./EventApi";
import "./EventsSection.css";
import { useHistory } from "react-router-dom";
import { emptyPage, PageDTO } from "../api";
import uniqBy from "lodash/uniqBy";
import { MenuButton, PrimaryButton } from "../Buttons/Buttons";
import moment, { Moment } from "moment";

export const EventsSection = (): ReactElement => {
    const [userEventPage, setUserEventPage] = useState<PageDTO<TsrEvent>>(emptyPage);
    const [userEvents, setUserEvents] = useState<TsrEvent[]>([]);
    const [orgEventPage, setOrgEventPage] = useState<PageDTO<TsrEvent>>(emptyPage);
    const [orgEvents, setOrgEvents] = useState<TsrEvent[]>([]);

    useEffect(() => {
        (async () => {
            await getActiveEventsByUserId()
                .then((result) => {
                    setUserEventPage(result);
                    setUserEvents(result.items);
                })
                .catch((e) => {
                    console.error(`Error getting user events: ${e.message}`);
                });
            await getActiveEventsByOrganizationIds()
                .then((result) => {
                    setOrgEventPage(result);
                    setOrgEvents(result.items);
                })
                .catch((e) => {
                    console.error(`Error getting org events: ${e.message}`);
                });
        })();
    }, [setUserEventPage, setUserEvents, setOrgEventPage, setOrgEvents]);

    const showMyEvents = (): ReactElement => {
        return (
            <>
                {userEvents.map((e) => (
                    <SingleEvent key={`key-${e.eventId}`} event={e} dataTestId="user-event" />
                ))}
            </>
        );
    };

    const showOrgEvents = (): ReactElement => {
        return (
            <>
                {orgEvents.map((e) => (
                    <SingleEvent key={`key-${e.eventId}`} event={e} dataTestId="org-event" />
                ))}
            </>
        );
    };

    const loadOrgEvents = (page: number) => {
        (async () => {
            await getActiveEventsByOrganizationIds({ page })
                .then((results) => {
                    setOrgEventPage(results);
                    setOrgEvents(
                        (prevState) => uniqBy([...prevState, ...results.items], (e) => e.eventId), // TODO possible real time update duplicates?
                    );
                })
                .catch((error) => {
                    console.error(error.message);
                });
        })();
    };

    const loadUserEvents = (page: number) => {
        (async () => {
            await getActiveEventsByUserId({ page })
                .then((results) => {
                    setUserEventPage(results);
                    setUserEvents(
                        (prevState) => uniqBy([...prevState, ...results.items], (e) => e.eventId), // TODO possible real time update duplicates?
                    );
                })
                .catch((error) => {
                    console.error(error.message);
                });
        })();
    };

    const noEvents = () => {
        return <div className={"EventsSection-No-Events"}>No Active Events</div>;
    };

    return (
        <div className={"EventsSection-Content"}>
            <div className={"EventsSection-Events"}>
                <h2>My Active Events</h2>
                <div className="space-2" />
                {showMyEvents()}
                {userEventPage.totalResults === 0 ? noEvents() : <></>}
                {userEventPage.last || userEventPage.totalResults === 0 ? (
                    <></>
                ) : (
                    <MenuButton
                        data-testid={"user-event-more"}
                        onClick={() => loadUserEvents(userEventPage.pageNumber + 1)}
                    >
                        load more
                    </MenuButton>
                )}
            </div>
            <div className={"EventsSection-Events"}>
                <h2>{"My Organization's Active Events"}</h2>
                <div className="space-2" />
                {showOrgEvents()}
                {orgEventPage.totalResults === 0 ? noEvents() : <></>}
                {orgEventPage.last || orgEventPage.totalResults === 0 ? (
                    <></>
                ) : (
                    <PrimaryButton
                        data-testid={"org-event-more"}
                        onClick={() => loadOrgEvents(orgEventPage.pageNumber + 1)}
                    >
                        load more
                    </PrimaryButton>
                )}
            </div>
        </div>
    );
};

interface SingleEventProps {
    event: TsrEvent;
    className?: string;
    dataTestId?: string;
}

const SingleEvent = ({ event, className = "", dataTestId }: SingleEventProps): ReactElement => {
    const history = useHistory();
    const SHORT_DATE_FORMAT = "M/D/YY";

    const shortDateFormat = (date: Moment): string => `${date.local().format(SHORT_DATE_FORMAT)}`;

    return (
        <div
            className={`EventsSection-SingleEvent ${className}`}
            data-testid={`${dataTestId}-${event.eventId}`}
        >
            {event.eventName}
            <MenuButton
                onClick={() => history.push(`/event/${event.eventId}`)}
                className={"EventsSection-View-Button"}
            >
                View Event
            </MenuButton>
            <div className={"EventsSection-SingleEvent-Container"}>
                <span>Start Date:{shortDateFormat(moment(event.startDate))}</span>
                <span>End Date:{shortDateFormat(moment(event.endDate))}</span>
            </div>
        </div>
    );
};
