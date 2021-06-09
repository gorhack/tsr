import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { CreatableTsrEvent, getEventById, saveEvent, TsrEvent, updateEvent } from "./EventApi";
import "./CreateEvent.css";
import "../Form.css";
import { LinkButton } from "../Buttons/Buttons";
import { useParams } from "react-router-dom";
import { RouteParams } from "./EventPage";
import { EventForm } from "./EventForm";

export const CreateEvent: React.FC = () => {
    const history = useHistory();
    const { eventId } = useParams<RouteParams>();

    // TODO fill in empty tsr event
    const [tsrEvent, setTsrEvent] = useState<TsrEvent>();

    useEffect(() => {
        if (!eventId) {
            return;
        }
        (async () => {
            await getEventById(parseInt(eventId))
                .then((event) => {
                    setTsrEvent(event);
                })
                .catch((error) => {
                    console.error(`error getting event by id ${eventId}, ${error.message.value}`);
                });
        })();
    }, [eventId, setTsrEvent]);

    const onCancel = (): void => {
        if (history.location.pathname.startsWith(`/editEvent/${eventId}`)) {
            history.push(`/event/${eventId}`);
        } else {
            history.push("/");
        }
    };

    const handleSubmit = async (event: CreatableTsrEvent | TsrEvent): Promise<void> => {
        if (isTsrEvent(event)) {
            await updateEvent(event)
                .then((result) => {
                    history.push(`/event/${result.eventId}`);
                })
                .catch((error) => {
                    console.error("error saving the event", error.message);
                });
        } else {
            await saveEvent(event)
                .then((result) => {
                    history.push(`/event/${result.eventId}`);
                })
                .catch((error) => {
                    console.error("error saving the event", error.message);
                });
        }
    };

    return (
        <>
            <LinkButton onClick={() => history.push("/")}>{"< back to events"}</LinkButton>
            <EventForm
                event={tsrEvent ? tsrEvent : makeBlankCreateableTsrEvent()}
                formHeader="Create an Event"
                onCancel={onCancel}
                submitData={handleSubmit}
            />
        </>
    );
};

export function isTsrEvent(event: CreatableTsrEvent | TsrEvent): event is TsrEvent {
    return !!event.eventId;
}

export function makeBlankCreateableTsrEvent(): CreatableTsrEvent {
    return {
        eventName: "",
        organizations: [],
        startDate: "",
        endDate: "",
    };
}
