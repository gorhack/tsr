import React, { ReactElement, useEffect, useState } from "react";
import { getActiveEventsByOrganizationIds, getActiveEventsByUserId, TsrEvent } from "./EventApi";
import "./EventsSection.css";
import { useHistory } from "react-router-dom";
import { emptyPage, PageDTO } from "../api";
import uniqBy from "lodash/uniqBy";

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
                    console.error(error);
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
                    console.error(error);
                });
        })();
    };

    return (
        <div className={"EventsSection-Content"}>
            <div className={"EventsSection-Events"}>
                <h2>My Active Events</h2>
                <div className="space-2" />
                {showMyEvents()}
                {userEventPage.last ? (
                    <></>
                ) : (
                    <button
                        data-testid={"user-event-more"}
                        onClick={() => loadUserEvents(userEventPage.pageNumber + 1)}
                    >
                        load more
                    </button>
                )}
            </div>
            <div className={"EventsSection-Events"}>
                <h2>{"My Organization's Active Events"}</h2>
                <div className="space-2" />
                {showOrgEvents()}
                {orgEventPage.last ? (
                    <></>
                ) : (
                    <button
                        data-testid={"org-event-more"}
                        onClick={() => loadOrgEvents(orgEventPage.pageNumber + 1)}
                    >
                        load more
                    </button>
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
    return (
        <div
            className={`EventsSection-SingleEvent ${className}`}
            data-testid={`${dataTestId}-${event.eventId}`}
            onClick={() => history.push(`/event/${event.eventId}`)}
        >
            {event.eventName}
        </div>
    );
};
