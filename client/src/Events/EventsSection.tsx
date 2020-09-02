import React, { ReactElement, useEffect, useState } from "react";
import { getAllEvents, TsrEvent } from "./EventApi";
import "./EventsSection.css";
import { TsrUser } from "../Users/UserApi";
import { useHistory } from "react-router-dom";
import { emptyPage, PageDTO } from "../api";
import uniqBy from "lodash/uniqBy";

interface EventsSectionProps {
    user: TsrUser;
}

export const EventsSection = ({ user }: EventsSectionProps): ReactElement => {
    const [userEventPage, setUserEventPage] = useState<PageDTO<TsrEvent>>(emptyPage);
    const [userEvents, setUserEvents] = useState<TsrEvent[]>([]);
    const [orgEventPage, setOrgEventPage] = useState<PageDTO<TsrEvent>>(emptyPage);
    const [orgEvents, setOrgEvents] = useState<TsrEvent[]>([]);

    useEffect(() => {
        (async () => {
            try {
                // TODO separate user vs org api
                const newEventList = await getAllEvents();
                setUserEventPage(newEventList);
                setUserEvents(newEventList.items);
                setOrgEventPage(newEventList); // TODO separate call for org events
                setOrgEvents(newEventList.items);
            } catch (e) {
                console.error(`Error getting all events. ${e.message.error}`);
            }
        })();
    }, [setUserEventPage, setUserEvents, setOrgEventPage, setOrgEvents]);

    const showMyEvents = (): ReactElement => {
        return (
            <>
                {userEvents
                    .filter((e) => e.audit.createdBy === user.userId)
                    .map((e) => (
                        <SingleEvent key={`key-${e.eventId}`} event={e} dataTestId="user-event" />
                    ))}
            </>
        );
    };

    // TODO add filter by user org on backend
    const showOrgEvents = (): ReactElement => {
        return (
            <>
                {orgEvents
                    .filter((e) => e.audit.createdBy !== user.userId)
                    .map((e) => (
                        <SingleEvent key={`key-${e.eventId}`} event={e} dataTestId="org-event" />
                    ))}
            </>
        );
    };

    const loadOrgEvents = (page: number) => {
        (async () => {
            await getAllEvents({ page })
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
            await getAllEvents({ page })
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
                <h2>My Created Events</h2>
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
                <h2>My Organization Events</h2>
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
            className={"EventsSection-SingleEvent " + className}
            data-testid={`${dataTestId}-${event.eventId}`}
            onClick={() => history.push(`/event/${event.eventId}`)}
        >
            {event.eventName}
        </div>
    );
};
