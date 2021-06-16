import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getEventById, TsrEvent, updateEvent } from "./EventApi";
import moment from "moment";
import { EventDetails } from "./EventDetails";
import { LinkButton, PrimaryButton } from "../Buttons/Buttons";
import "./EventPage.css";
import { EventTaskSection } from "./Task/EventTaskSection";
import { LONG_DATE_FORMAT } from "../api";
import { EventForm } from "./EventForm";

export interface RouteParams {
    eventId: string;
}

export const EventPage: React.FC = () => {
    const history = useHistory();
    const { eventId } = useParams<RouteParams>();
    const [tsrEvent, setTsrEvent] = useState<TsrEvent | undefined>(undefined);
    const [editing, setEditing] = useState(false);

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

    if (!tsrEvent) {
        return <></>;
    }

    const setEditEventFunc = (): void => {
        history.push(`/editEvent/${tsrEvent.eventId}`);
    };
    const startDate = new Date(tsrEvent.startDate).toLocaleString();
    const endDate = new Date(tsrEvent.endDate).toLocaleString();

    const headerEventName = (): string => {
        if (tsrEvent.eventName === "") {
            return "event details";
        } else {
            return `${tsrEvent.eventName} details`;
        }
    };

    const headerDates = (): string => {
        if (startDate === endDate) {
            return startDate;
        } else {
            return `${startDate} - ${endDate}`;
        }
    };

    const handleUpdate = async (event: TsrEvent) => {
        await updateEvent(event).then((data) => {
            setTsrEvent(data);
            setEditing(false);
        });
    };

    return (
        <>
            <LinkButton onClick={() => history.push("/")}>{"< back to events"}</LinkButton>
            <div className="space-3" />
            {editing ? (
                <EventForm
                    event={tsrEvent}
                    formHeader="Edit Event"
                    onCancel={() => setEditing(false)}
                    submitData={handleUpdate}
                />
            ) : (
                <>
                    <div className={"EventPage-Header flex-row"}>
                        <div>
                            <h1>{headerEventName()}</h1>
                            <h2>{headerDates()}</h2>
                        </div>
                        <PrimaryButton onClick={() => setEditing(true)}>
                            {"edit event"}
                        </PrimaryButton>
                    </div>
                    <div className="Event-Details-Container">
                        <EventDetails tsrEvent={tsrEvent} />
                        <div className="space-3" />
                        <EventTaskSection tsrEvent={tsrEvent} />
                    </div>
                </>
            )}
        </>
    );
};
