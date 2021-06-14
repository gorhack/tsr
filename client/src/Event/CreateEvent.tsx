import React from "react";
import { useHistory } from "react-router";
import { CreatableTsrEvent, saveEvent, TsrEvent } from "./EventApi";
import { LinkButton } from "../Buttons/Buttons";
import { EventForm } from "./EventForm";

export const CreateEvent: React.FC = () => {
    const history = useHistory();

    const onCancel = (): void => {
        history.push("/");
    };

    const handleSubmit = async (event: CreatableTsrEvent | TsrEvent): Promise<void> => {
        await saveEvent(event)
            .then((result) => {
                history.push(`/event/${result.eventId}`);
            })
            .catch((error) => {
                console.error("error saving the event", error.message);
            });
    };

    return (
        <>
            <LinkButton onClick={() => history.push("/")}>{"< back to events"}</LinkButton>
            <EventForm
                event={makeBlankCreateableTsrEvent()}
                formHeader="Create an Event"
                onCancel={onCancel}
                submitData={handleSubmit}
            />
        </>
    );
};

export function makeBlankCreateableTsrEvent(): CreatableTsrEvent {
    return {
        eventName: "",
        organizations: [],
        startDate: "",
        endDate: "",
    };
}
